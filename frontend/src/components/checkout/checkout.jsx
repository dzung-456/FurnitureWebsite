import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import cartService from "../../services/cartService";
import checkoutService from "../../services/checkoutService";
import couponService from "../../services/couponService";
import paymentService from "../../services/paymentService";
import { getAuthSnapshot, setAuth } from "../../services/authStorage";

const getStoredAuthForState = () => {
  const { token, user, loginAt } = getAuthSnapshot();
  if (!token) return null;
  return { ...(user || {}), token, loginAt: loginAt || undefined };
};

const fetchMe = async (token) => {
  const res = await fetch("/api/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await res.json();
  if (data?.code === "200") return data?.data;
  return null;
};

export function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();

  const didAutoApplyCouponRef = useRef(false);
  const didHandlePaymentReturnRef = useRef(false);

  // Check if this is a payment return immediately
  const params = new URLSearchParams(location.search || "");
  const isPaymentReturn = 
    params.get("paypal") === "1" || 
    params.get("vnpay") === "1" ||
    !!params.get("vnp_ResponseCode") ||
    !!params.get("vnp_TxnRef") ||
    !!params.get("vnp_SecureHash");

  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [finalizingPayment, setFinalizingPayment] = useState(isPaymentReturn); // Set true immediately if payment return
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [user, setUser] = useState(getStoredAuthForState());
  const [items, setItems] = useState([]);

  const [shippingFullname, setShippingFullname] = useState("");
  const [shippingPhone, setShippingPhone] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [shippingCity, setShippingCity] = useState("");
  const [shippingEmail, setShippingEmail] = useState("");
  const [note, setNote] = useState("");

  const [shippingFee, setShippingFee] = useState(50000);
  const [paymentMethod, setPaymentMethod] = useState("cod");

  const [couponCode, setCouponCode] = useState("");
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  const formatVnd = (val) => `${Number(val || 0).toLocaleString("vi-VN")}₫`;

  const getUnitPrice = (product) => {
    const price = Number(product?.price || 0);
    const sale = Number(product?.sale_price || 0);
    return sale > 0 ? sale : price;
  };

  const loadUserAndCart = useCallback(async () => {
    const { token, user: storedUser, loginAt } = getAuthSnapshot();
    if (
      !token ||
      !cartService.isAuthenticated() ||
      !checkoutService.isAuthenticated()
    ) {
      navigate("/login");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const [me, cartRes] = await Promise.all([
        fetchMe(token).catch(() => null),
        cartService.getCart(),
      ]);

      const stateUser = me
        ? { ...(storedUser || {}), ...me, token, loginAt: loginAt || undefined }
        : { ...(storedUser || {}), token, loginAt: loginAt || undefined };
      setUser(stateUser);
      setAuth({
        token,
        user: stateUser,
        loginAt: loginAt || stateUser?.loginAt,
      });

      const cart = cartRes?.data;
      const cartItems = Array.isArray(cart?.items) ? cart.items : [];
      setItems(cartItems);
    } catch (err) {
      if (err?.code === "NOT_AUTHENTICATED") {
        navigate("/login");
        return;
      }
      console.error("Failed to load checkout data", err);
      setError("Không tải được dữ liệu thanh toán");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    loadUserAndCart();
  }, [loadUserAndCart]);

  useEffect(() => {
    // Handle payment return (VNPay redirect and PayPal return/cancel) on the same /checkout route.
    if (didHandlePaymentReturnRef.current) return;

    const params = new URLSearchParams(location.search || "");
    const isPaypalReturn = params.get("paypal") === "1";
    const isVnpayReturn = params.get("vnpay") === "1";

    const hasVnpayParams =
      !!params.get("vnp_ResponseCode") ||
      !!params.get("vnp_TxnRef") ||
      !!params.get("vnp_SecureHash");

    if (!isPaypalReturn && !isVnpayReturn && !hasVnpayParams) return;

    didHandlePaymentReturnRef.current = true;

    const cleanupUrl = () => {
      try {
        const clean = `${location.pathname}`;
        window.history.replaceState({}, "", clean);
      } catch {
        // ignore
      }
    };

    if (isVnpayReturn || hasVnpayParams) {
      // Preferred flow: VNPay returns directly to frontend with vnp_* params.
      // We verify signature & persist payment via backend confirm endpoint.

      if (!paymentService.isAuthenticated()) {
        navigate("/login");
        return;
      }

      const obj = {};
      for (const [k, v] of params.entries()) {
        if (String(k).startsWith("vnp_")) {
          obj[k] = v;
        }
      }

      // If this is the old redirect format (success=1), keep behavior.
      const legacySuccess = params.get("success");
      if (legacySuccess === "1") {
        const oid = params.get("order_id") || "";
        try {
          const qs = new URLSearchParams();
          qs.set("method", "vnpay");
          if (oid) qs.set("order_id", oid);
          navigate(`/order-success?${qs.toString()}`, { replace: true });
        } catch {
          navigate("/order-success?method=vnpay", { replace: true });
        }
        return;
      }

      setFinalizingPayment(true);
      setError("");
      setSuccess("");

      paymentService
        .confirmVnpayPayment(obj)
        .then((res) => {
          const ok = !!res?.data?.success;
          const oid = String(res?.data?.order_id || "");
          const code = String(res?.data?.response_code || "");

          if (ok) {
            const qs = new URLSearchParams();
            qs.set("method", "vnpay");
            if (oid) qs.set("order_id", oid);
            navigate(`/order-success?${qs.toString()}`, { replace: true });
            return;
          }

          setError(
            `Thanh toán VNPay thất bại${code ? ` (code: ${code})` : ""}`
          );
        })
        .catch((err) => {
          if (err?.code === "NOT_AUTHENTICATED") {
            navigate("/login");
            return;
          }
          const msg =
            err?.response?.data?.detail ||
            err?.response?.data?.message ||
            "Xác nhận thanh toán VNPay thất bại";
          setError(String(msg));
        })
        .finally(() => {
          setFinalizingPayment(false);
          cleanupUrl();
        });

      return;
    }

    // PayPal: if cancel=1 => show message. If token+order_id exists => capture.
    if (params.get("cancel") === "1") {
      setError("Bạn đã hủy thanh toán PayPal.");
      setSuccess("");
      cleanupUrl();
      return;
    }

    const paypalOrderId = params.get("token") || "";
    const orderId = Number(params.get("order_id") || 0);
    if (!paypalOrderId || !orderId) {
      setError("Thiếu thông tin để xác nhận thanh toán PayPal.");
      setSuccess("");
      cleanupUrl();
      return;
    }

    if (!paymentService.isAuthenticated()) {
      navigate("/login");
      return;
    }

    setFinalizingPayment(true);
    setError("");
    setSuccess("");
    paymentService
      .capturePaypalOrder({ orderId, paypalOrderId })
      .then((res) => {
        const status = res?.data?.status || "";
        if (String(status).toUpperCase() === "COMPLETED") {
          setSuccess("Thanh toán PayPal thành công!");
        } else {
          setError(
            `Thanh toán PayPal chưa hoàn tất (status: ${status || "UNKNOWN"})`
          );
        }
      })
      .catch((err) => {
        if (err?.code === "NOT_AUTHENTICATED") {
          navigate("/login");
          return;
        }
        const msg =
          err?.response?.data?.detail ||
          err?.response?.data?.message ||
          "Xác nhận thanh toán PayPal thất bại";
        setError(String(msg));
      })
      .finally(() => {
        setFinalizingPayment(false);
        cleanupUrl();
      });
  }, [location.pathname, location.search, navigate]);

  useEffect(() => {
    // Prefill form from user (if present)
    if (!user) return;
    setShippingFullname(
      (prev) => prev || user?.full_name || user?.username || ""
    );
    setShippingPhone((prev) => prev || user?.phone || "");
    setShippingEmail((prev) => prev || user?.email || "");
  }, [user]);

  const subtotal = useMemo(() => {
    return (items || []).reduce((sum, item) => {
      const unit = getUnitPrice(item?.product);
      const qty = Number(item?.quantity || 0);
      return sum + unit * qty;
    }, 0);
  }, [items]);

  const applyCoupon = useCallback(
    async (code, orderAmount, { silent } = { silent: false }) => {
      const normalized = String(code || "").trim();
      if (!normalized) {
        setAppliedCoupon(null);
        setCouponError("");
        try {
          sessionStorage.removeItem("checkout:couponCode");
        } catch {
          // ignore
        }
        return;
      }

      if (!cartService.isAuthenticated()) {
        if (!silent) navigate("/login");
        return;
      }

      setApplyingCoupon(true);
      if (!silent) setCouponError("");
      try {
        const res = await couponService.applyCoupon({
          code: normalized,
          orderAmount,
        });
        const data = res?.data;
        setAppliedCoupon(data || null);
        setCouponError("");
        try {
          sessionStorage.setItem("checkout:couponCode", normalized);
        } catch {
          // ignore
        }
      } catch (err) {
        if (err?.code === "NOT_AUTHENTICATED") {
          if (!silent) navigate("/login");
          return;
        }
        const msg =
          err?.response?.data?.detail ||
          err?.response?.data?.message ||
          "Không áp dụng được mã giảm giá";
        setAppliedCoupon(null);
        if (!silent) setCouponError(String(msg));
      } finally {
        setApplyingCoupon(false);
      }
    },
    [navigate]
  );

  useEffect(() => {
    // Prefill coupon from cart page (sessionStorage)
    try {
      const stored = sessionStorage.getItem("checkout:couponCode") || "";
      if (stored && !couponCode) {
        setCouponCode(stored);
      }
    } catch {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Auto-apply coupon once on initial load so totals update immediately.
    // We intentionally do NOT auto-apply on every couponCode keystroke.
    if (didAutoApplyCouponRef.current) return;
    if (loading) return;
    if (subtotal <= 0) return;

    const normalized = String(couponCode || "").trim();
    if (!normalized) {
      didAutoApplyCouponRef.current = true;
      return;
    }

    const applied = String(appliedCoupon?.code || "").trim();
    if (applied && applied.toUpperCase() === normalized.toUpperCase()) {
      didAutoApplyCouponRef.current = true;
      return;
    }

    didAutoApplyCouponRef.current = true;
    applyCoupon(normalized, subtotal, { silent: true });
  }, [applyCoupon, appliedCoupon?.code, couponCode, loading, subtotal]);

  useEffect(() => {
    // If subtotal changes, try to re-apply existing coupon
    if (appliedCoupon?.code) {
      applyCoupon(appliedCoupon.code, subtotal, { silent: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subtotal]);

  const discountAmount = Number(appliedCoupon?.discount_amount || 0);
  const discountedSubtotal =
    appliedCoupon && typeof appliedCoupon?.final_amount === "number"
      ? Number(appliedCoupon.final_amount)
      : Math.max(0, subtotal - discountAmount);

  const effectiveShippingFee = subtotal > 0 ? Number(shippingFee || 0) : 0;
  const total = useMemo(
    () => discountedSubtotal + effectiveShippingFee,
    [discountedSubtotal, effectiveShippingFee]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!checkoutService.isAuthenticated()) {
      navigate("/login");
      return;
    }

    if (!items || items.length === 0) {
      setError("Giỏ hàng đang trống");
      return;
    }

    if (
      !shippingFullname.trim() ||
      !shippingPhone.trim() ||
      !shippingAddress.trim()
    ) {
      setError("Vui lòng nhập đầy đủ Họ tên, Số điện thoại, Địa chỉ");
      return;
    }

    setPlacing(true);
    try {
      const payload = {
        shipping_fullname: shippingFullname.trim(),
        shipping_phone: shippingPhone.trim(),
        shipping_address: shippingAddress.trim(),
        shipping_city: shippingCity.trim() || null,
        shipping_email: shippingEmail.trim() || null,
        payment_method: paymentMethod,
        note: note.trim() || null,
        shipping_fee: effectiveShippingFee,
        coupon_code: appliedCoupon?.code || null,
      };

      const orderRes = await checkoutService.createOrder(payload);
      const order = orderRes?.data;
      const orderId = Number(order?.id || 0);
      if (!orderId) {
        throw new Error("ORDER_CREATE_FAILED");
      }

      if (typeof window !== "undefined" && window?.dispatchEvent) {
        window.dispatchEvent(new Event("cart:updated"));
      }

      if (paymentMethod === "cod") {
        try {
          const qs = new URLSearchParams();
          qs.set("method", "cod");
          qs.set("order_id", String(orderId));
          navigate(`/order-success?${qs.toString()}`);
        } catch {
          navigate("/order-success?method=cod");
        }
        return;
      }

      if (paymentMethod === "bank_transfer") {
        const payRes = await paymentService.createVnpayPayment(orderId);
        const url = payRes?.data?.payment_url;
        if (!url) {
          throw new Error("VNPAY_CREATE_FAILED");
        }
        window.location.href = url;
        return;
      }

      if (paymentMethod === "paypal") {
        const ppRes = await paymentService.createPaypalOrder(orderId);
        const approveUrl = ppRes?.data?.approve_url;
        if (!approveUrl) {
          throw new Error("PAYPAL_CREATE_FAILED");
        }
        window.location.href = approveUrl;
        return;
      }

      // Fallback
      setSuccess("Đặt hàng thành công!");
      navigate("/");
    } catch (err) {
      if (err?.code === "NOT_AUTHENTICATED") {
        navigate("/login");
        return;
      }
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        "Đặt hàng thất bại";
      setError(String(msg));
    } finally {
      setPlacing(false);
    }
  };

  // If this is a payment return, show loading screen immediately
  if (finalizingPayment && isPaymentReturn) {
    return (
      <section className="checkout-area section-space">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="your-order" style={{ textAlign: "center", padding: "60px 20px" }}>
                <div style={{ marginBottom: "30px" }}>
                  <div className="spinner-border text-primary" role="status" style={{ width: "4rem", height: "4rem" }}>
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
                <h3 style={{ marginBottom: "15px", color: "#333" }}>
                  Đang xác nhận thanh toán...
                </h3>
                <p style={{ color: "#666", fontSize: "16px" }}>
                  Vui lòng đợi trong giây lát. Chúng tôi đang xử lý giao dịch của bạn.
                </p>
                {error ? (
                  <div style={{ marginTop: "20px", padding: "15px", backgroundColor: "#f8d7da", color: "#721c24", borderRadius: "5px" }}>
                    {error}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="checkout-area section-space">
      <div className="container">
        <form action="#" onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-lg-6">
              <div className="checkbox-form">
                <h3 className="mb-15">Chi tiết hóa đơn</h3>

                {loading ? <div>Đang tải dữ liệu...</div> : null}

                {!loading && items.length === 0 ? (
                  <div>
                    Giỏ hàng đang trống.{" "}
                    <Link to="/cart">Quay lại giỏ hàng</Link>
                  </div>
                ) : null}

                <div className="row g-5">
                  <div className="col-md-6">
                    <div className="checkout-form-list">
                      <label>
                        Họ và Tên <span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Họ và Tên"
                        value={shippingFullname}
                        onChange={(e) => setShippingFullname(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="checkout-form-list">
                      <label>
                        Số điện thoại <span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Số điện thoại"
                        value={shippingPhone}
                        onChange={(e) => setShippingPhone(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="col-md-12">
                    <div className="checkout-form-list">
                      <label>
                        Địa chỉ Email <span className="required">*</span>
                      </label>
                      <input
                        type="email"
                        placeholder="Địa chỉ email"
                        value={shippingEmail}
                        onChange={(e) => setShippingEmail(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="col-md-12">
                    <div className="checkout-form-list">
                      <label>
                        Địa chỉ <span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Địa chỉ"
                        value={shippingAddress}
                        onChange={(e) => setShippingAddress(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="col-md-12">
                    <div className="checkout-form-list">
                      <label>
                        Thành phố / Tỉnh <span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Thành phố / Tỉnh"
                        value={shippingCity}
                        onChange={(e) => setShippingCity(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="col-md-12">
                    <div className="checkout-form-list">
                      <label>Ghi chú đơn hàng</label>
                      <textarea
                        id="checkout-mess"
                        cols="30"
                        rows="6"
                        placeholder="Ghi chú về đơn hàng của bạn..."
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                      ></textarea>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="your-order">
                <h3>Đơn hàng của bạn</h3>
                <div className="your-order-table table-responsive">
                  <table>
                    <thead>
                      <tr>
                        <th className="product-name">Sản phẩm</th>
                        <th className="product-total">Tổng cộng</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(items || []).map((item) => {
                        const product = item?.product;
                        const unit = getUnitPrice(product);
                        const qty = Number(item?.quantity || 0);
                        const line = unit * qty;
                        return (
                          <tr
                            className="cart_item"
                            key={item?.id || `${product?.id}-${qty}`}
                          >
                            <td className="product-name">
                              {product?.name || "Sản phẩm"}
                              <strong className="product-quantity">
                                {" "}
                                × {qty}
                              </strong>
                            </td>
                            <td className="product-total">
                              <span className="amount">{formatVnd(line)}</span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="cart-subtotal">
                        <th>Tổng phụ giỏ hàng</th>
                        <td>
                          <span className="amount">{formatVnd(subtotal)}</span>
                        </td>
                      </tr>
                      {appliedCoupon?.code ? (
                        <tr className="cart-subtotal">
                          <th>Giảm giá ({appliedCoupon.code})</th>
                          <td>
                            <span className="amount">
                              -{formatVnd(discountAmount)}
                            </span>
                          </td>
                        </tr>
                      ) : null}
                      <tr className="shipping">
                        <th>Phí vận chuyển</th>
                        <td>
                          <ul>
                            <li>
                              <input
                                type="radio"
                                name="shipping"
                                checked={Number(shippingFee) === 50000}
                                onChange={() => setShippingFee(50000)}
                              />
                              <label>
                                Vận chuyển nhanh:{" "}
                                <span className="amount">50.000₫</span>
                              </label>
                            </li>
                            <li>
                              <input
                                type="radio"
                                name="shipping"
                                checked={Number(shippingFee) === 70000}
                                onChange={() => setShippingFee(70000)}
                              />
                              <label>
                                Vận chuyển hỏa tốc:{" "}
                                <span className="amount">70.000₫</span>
                              </label>
                            </li>
                          </ul>
                        </td>
                      </tr>
                      <tr className="order-total">
                        <th>Tổng đơn hàng</th>
                        <td>
                          <strong>
                            <span className="amount">{formatVnd(total)}</span>
                          </strong>
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
                <div className="coupon-all" style={{ marginBottom: 12 }}>
                  <div className="coupon d-flex align-items-center">
                    <input
                      id="coupon_code"
                      className="input-text"
                      name="coupon_code"
                      placeholder="Nhập mã giảm giá"
                      type="text"
                      value={couponCode}
                      onChange={(e) => {
                        setCouponCode(e.target.value);
                        setCouponError("");
                      }}
                    />
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        const normalized = String(couponCode || "").trim();
                        if (!normalized) {
                          setAppliedCoupon(null);
                          setCouponError("");
                          try {
                            sessionStorage.removeItem("checkout:couponCode");
                          } catch {
                            // ignore
                          }
                          return;
                        }
                        applyCoupon(normalized, subtotal);
                      }}
                      className="fill-btn"
                      type="button"
                      disabled={
                        applyingCoupon ||
                        subtotal <= 0 ||
                        !cartService.isAuthenticated() ||
                        (!couponCode.trim() && !appliedCoupon?.code)
                      }
                    >
                      <span className="fill-btn-inner">
                        <span className="fill-btn-normal">
                          {applyingCoupon
                            ? "Đang áp dụng..."
                            : !couponCode.trim() && appliedCoupon?.code
                            ? "Hủy mã giảm giá"
                            : "Nhập mã"}
                        </span>
                        <span className="fill-btn-hover">Nhập mã</span>
                      </span>
                    </button>
                  </div>
                  {couponError ? (
                    <div style={{ marginTop: 8, color: "#d9534f" }}>
                      {couponError}
                    </div>
                  ) : null}
                  {appliedCoupon?.code ? (
                    <div style={{ marginTop: 8 }}>
                      Đã áp dụng mã: <b>{appliedCoupon.code}</b>
                    </div>
                  ) : null}
                </div>
                <div className="payment-method">
                  <div
                    className="checkout-form-list"
                    style={{ marginBottom: 16 }}
                  >
                    <label>
                      Phương thức thanh toán <span className="required">*</span>
                    </label>
                    <ul
                      style={{
                        listStyle: "none",
                        paddingLeft: 0,
                        marginBottom: 0,
                      }}
                    >
                      <li
                        style={{
                          display: "flex",
                          gap: 8,
                          alignItems: "center",
                          marginBottom: 8,
                        }}
                      >
                        <input
                          type="radio"
                          name="payment_method"
                          checked={paymentMethod === "cod"}
                          onChange={() => setPaymentMethod("cod")}
                        />
                        <span>Trả tiền trực tiếp (COD)</span>
                      </li>

                      <li
                        style={{
                          display: "flex",
                          gap: 8,
                          alignItems: "center",
                          marginBottom: 8,
                        }}
                      >
                        <input
                          type="radio"
                          name="payment_method"
                          checked={paymentMethod === "bank_transfer"}
                          onChange={() => setPaymentMethod("bank_transfer")}
                        />
                        <span>Chuyển khoản ngân hàng (VNPay)</span>
                      </li>

                      <li
                        style={{
                          display: "flex",
                          gap: 8,
                          alignItems: "center",
                        }}
                      >
                        <input
                          type="radio"
                          name="payment_method"
                          checked={paymentMethod === "paypal"}
                          onChange={() => setPaymentMethod("paypal")}
                        />
                        <span>PayPal</span>
                      </li>
                    </ul>
                  </div>

                  {error ? (
                    <div style={{ marginTop: 10, color: "#d9534f" }}>
                      {error}
                    </div>
                  ) : null}
                  {success ? (
                    <div style={{ marginTop: 10, color: "#198754" }}>
                      {success}
                    </div>
                  ) : null}

                  <div className="order-button-payment mt-20">
                    <button
                      className="fill-btn"
                      type="submit"
                      disabled={
                        placing ||
                        finalizingPayment ||
                        loading ||
                        !checkoutService.isAuthenticated() ||
                        items.length === 0
                      }
                    >
                      <span className="fill-btn-inner">
                        <span className="fill-btn-normal">
                          {finalizingPayment
                            ? "Đang xác nhận thanh toán..."
                            : placing
                            ? "Đang đặt hàng..."
                            : "Đặt hàng"}
                        </span>
                        <span className="fill-btn-hover">Đặt hàng</span>
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}

export default Checkout;
