import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import cartService from "../../services/cartService";
import couponService from "../../services/couponService";
export function Cart() {
  const navigate = useNavigate();
  const SHIPPING_FEE = 50000;
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyItemId, setBusyItemId] = useState(null);

  const [couponCode, setCouponCode] = useState("");
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  const normalizeImageUrl = (image) => {
    if (!image) return "";
    if (typeof image !== "string") return "";
    if (/^https?:\/\//i.test(image)) return image;
    if (image.startsWith("/")) return image;
    return `/uploads/products/${image}`;
  };

  const getUnitPrice = (product) => {
    const price = Number(product?.price || 0);
    const sale = Number(product?.sale_price || 0);
    return sale > 0 ? sale : price;
  };

  const formatVnd = (val) => `${Number(val || 0).toLocaleString("vi-VN")}₫`;

  const loadCart = useCallback(async () => {
    if (!cartService.isAuthenticated()) {
      setItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await cartService.getCart();
      const cart = res?.data;
      setItems(Array.isArray(cart?.items) ? cart.items : []);
    } catch (err) {
      if (err?.code === "NOT_AUTHENTICATED") {
        setItems([]);
        return;
      }
      console.error("Failed to load cart", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  useEffect(() => {
    const refresh = () => loadCart();
    // Only refresh on auth changes (login/logout), not on every cart update
    // Cart updates now use optimistic UI updates
    window.addEventListener("auth:changed", refresh);
    return () => {
      window.removeEventListener("auth:changed", refresh);
    };
  }, [loadCart]);

  const totals = useMemo(() => {
    const subtotal = (items || []).reduce((sum, item) => {
      const unit = getUnitPrice(item?.product);
      const qty = Number(item?.quantity || 0);
      return sum + unit * qty;
    }, 0);
    const discountAmount = Number(appliedCoupon?.discount_amount || 0);
    const finalAmount =
      appliedCoupon && typeof appliedCoupon?.final_amount === "number"
        ? Number(appliedCoupon.final_amount)
        : Math.max(0, subtotal - discountAmount);

    const shippingFee = subtotal > 0 ? SHIPPING_FEE : 0;
    const grandTotal = finalAmount + shippingFee;

    return {
      subtotal,
      discountAmount,
      shippingFee,
      total: grandTotal,
    };
  }, [items, appliedCoupon]);

  const applyCoupon = useCallback(
    async (code, orderAmount, { silent } = { silent: false }) => {
      const normalized = String(code || "").trim();
      if (!normalized) {
        setAppliedCoupon(null);
        setCouponError("");
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
    // If cart changes, try to re-apply existing coupon to the new subtotal.
    if (appliedCoupon?.code) {
      applyCoupon(appliedCoupon.code, totals.subtotal, { silent: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totals.subtotal]);

  const updateQuantity = async (itemId, quantity) => {
    if (!itemId) return;

    // Optimistic update - update UI immediately
    setItems((prev) =>
      prev.map((x) =>
        x?.id === itemId ? { ...x, quantity } : x
      )
    );

    setBusyItemId(itemId);
    try {
      await cartService.updateItemQuantity(itemId, quantity);
      // Refresh silently in background without showing loading state
    } catch (err) {
      if (err?.code === "NOT_AUTHENTICATED") {
        navigate("/login");
        return;
      }
      console.error("Failed to update quantity", err);
      alert("❌ Không thể cập nhật số lượng. Đang tải lại giỏ hàng...");
      // If failed, reload to get correct data
      loadCart();
    } finally {
      setBusyItemId(null);
    }
  };

  const handleMinus = (item) => {
    const next = Math.max(1, Number(item?.quantity || 1) - 1);
    updateQuantity(item?.id, next);
  };

  const handlePlus = (item) => {
    const next = Math.max(1, Number(item?.quantity || 1) + 1);
    updateQuantity(item?.id, next);
  };

  const handleRemove = async (itemId) => {
    if (!itemId) return;

    // Optimistic update - remove from UI immediately
    setItems((prev) => prev.filter((x) => x?.id !== itemId));

    setBusyItemId(itemId);
    try {
      await cartService.removeItem(itemId);
      // Success - already removed from UI
    } catch (err) {
      if (err?.code === "NOT_AUTHENTICATED") {
        navigate("/login");
        return;
      }
      console.error("Failed to remove item", err);
      alert("❌ Không thể xóa sản phẩm. Đang tải lại giỏ hàng...");
      // If failed, reload to get correct data
      loadCart();
    } finally {
      setBusyItemId(null);
    }
  };

  return (
    <div className="cart-area section-space">
      <div className="container">
        <div className="row">
          <div className="col-12">
            <div className="table-content table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th className="product-thumbnail">Ảnh</th>
                    <th className="cart-product-name">Sản phẩm</th>
                    <th className="product-price">Đơn giá</th>
                    <th className="product-quantity">Số lượng</th>
                    <th className="product-subtotal">Tổng</th>
                    <th className="product-remove">Xóa</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="text-center">
                        Đang tải giỏ hàng...
                      </td>
                    </tr>
                  ) : !cartService.isAuthenticated() ? (
                    <tr>
                      <td colSpan={6} className="text-center">
                        Bạn cần đăng nhập để xem giỏ hàng.{" "}
                        <button
                          type="button"
                          className="fill-btn"
                          onClick={() => navigate("/login")}
                        >
                          <span className="fill-btn-inner">
                            <span className="fill-btn-normal">Đăng nhập</span>
                            <span className="fill-btn-hover">Đăng nhập</span>
                          </span>
                        </button>
                      </td>
                    </tr>
                  ) : items.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center">
                        Giỏ hàng đang trống.
                      </td>
                    </tr>
                  ) : (
                    items.map((item) => {
                      const product = item?.product;
                      const unit = getUnitPrice(product);
                      const qty = Number(item?.quantity || 0);
                      const lineTotal = unit * qty;
                      const imageUrl = normalizeImageUrl(product?.image);

                      return (
                        <tr key={item?.id}>
                          <td className="product-thumbnail">
                            <Link to={`/productDetail/${product?.id || ""}`}>
                              {imageUrl ? (
                                <img src={imageUrl} alt={product?.name || ""} />
                              ) : (
                                <span>—</span>
                              )}
                            </Link>
                          </td>
                          <td className="product-name">
                            <Link to={`/productDetail/${product?.id || ""}`}>
                              {product?.name || ""}
                            </Link>
                          </td>
                          <td className="product-price">
                            <span className="amount">{formatVnd(unit)}</span>
                          </td>
                          <td className="product-quantity text-center">
                            <div className="product-quantity mt-10 mb-10">
                              <div className="product-quantity-form">
                                <form action="#">
                                  <button
                                    type="button"
                                    className="cart-minus"
                                    onClick={() => handleMinus(item)}
                                    disabled={busyItemId === item?.id}
                                  >
                                    <i className="far fa-minus"></i>
                                  </button>
                                  <input
                                    className="cart-input"
                                    type="text"
                                    value={qty}
                                    onChange={(e) => {
                                      const raw = e.target.value.replace(
                                        /\D/g,
                                        ""
                                      );
                                      const nextQty = raw
                                        ? Math.max(1, parseInt(raw, 10))
                                        : 1;
                                      setItems((prev) =>
                                        prev.map((x) =>
                                          x?.id === item?.id
                                            ? { ...x, quantity: nextQty }
                                            : x
                                        )
                                      );
                                    }}
                                    onBlur={(e) => {
                                      const raw = e.target.value.replace(
                                        /\D/g,
                                        ""
                                      );
                                      const nextQty = raw
                                        ? Math.max(1, parseInt(raw, 10))
                                        : 1;
                                      updateQuantity(item?.id, nextQty);
                                    }}
                                  />
                                  <button
                                    type="button"
                                    className="cart-plus"
                                    onClick={() => handlePlus(item)}
                                    disabled={busyItemId === item?.id}
                                  >
                                    <i className="far fa-plus"></i>
                                  </button>
                                </form>
                              </div>
                            </div>
                          </td>
                          <td className="product-subtotal">
                            <span className="amount">
                              {formatVnd(lineTotal)}
                            </span>
                          </td>
                          <td className="product-remove">
                            <button
                              type="button"
                              onClick={() => handleRemove(item?.id)}
                              disabled={busyItemId === item?.id}
                              style={{ background: "transparent", border: 0 }}
                              aria-label="Remove"
                            >
                              <i className="fa fa-times"></i>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            <div className="row">
              <div className="col-12">
                <div className="coupon-all">
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
                          // Clear applied coupon and reset totals
                          setAppliedCoupon(null);
                          setCouponError("");
                          return;
                        }
                        applyCoupon(normalized, totals.subtotal);
                      }}
                      className="fill-btn"
                      type="submit"
                      disabled={
                        applyingCoupon ||
                        totals.subtotal <= 0 ||
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
                              : "nhập mã giảm giá"}
                        </span>
                        <span className="fill-btn-hover">nhập mã giảm giá</span>
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
                  <div className="coupon2">
                    <button
                      onClick={() => loadCart()}
                      className="fill-btn"
                      type="submit"
                    >
                      <span className="fill-btn-inner">
                        <span className="fill-btn-normal">
                          Cập nhật giỏ hàng
                        </span>
                        <span className="fill-btn-hover">
                          Cập nhật giỏ hàng
                        </span>
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-lg-6 ml-auto">
                <div className="cart-page-total">
                  <h2>Tổng giỏ hàng</h2>
                  <ul className="mb-20">
                    <li>
                      Tổng phụ <span>{formatVnd(totals.subtotal)}</span>
                    </li>
                    {appliedCoupon?.code ? (
                      <li>
                        Giảm giá ({appliedCoupon.code}){" "}
                        <span>-{formatVnd(totals.discountAmount)}</span>
                      </li>
                    ) : null}
                    <li>
                      Phí vận chuyển{" "}
                      <span>{formatVnd(totals.shippingFee)}</span>
                    </li>
                    <li>
                      Tổng cộng <span>{formatVnd(totals.total)}</span>
                    </li>
                  </ul>
                  <button
                    type="button"
                    className="fill-btn"
                    disabled={
                      loading ||
                      !cartService.isAuthenticated() ||
                      (items?.length || 0) === 0
                    }
                    onClick={() => {
                      if (!cartService.isAuthenticated()) {
                        navigate("/login");
                        return;
                      }
                      try {
                        const code = String(
                          appliedCoupon?.code || couponCode || ""
                        ).trim();
                        if (code) {
                          sessionStorage.setItem("checkout:couponCode", code);
                        } else {
                          sessionStorage.removeItem("checkout:couponCode");
                        }
                      } catch {
                        // ignore
                      }
                      navigate("/checkout");
                    }}
                  >
                    <span className="fill-btn-inner">
                      <span className="fill-btn-normal">
                        Tiến hành thanh toán
                      </span>
                      <span className="fill-btn-hover">
                        Tiến hành thanh toán
                      </span>
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default Cart;
