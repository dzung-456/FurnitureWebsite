import React, { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Header from "../commons/Header.jsx";
import Footer from "../commons/Footer.jsx";
import Offcanvas from "../commons/OffCanvas.jsx";
import CheckoutBanner from "../banners/checkoutBanner.jsx";

export function OrderSuccessPage({ showOffcanvas, setShowOffcanvas }) {
  const location = useLocation();
  const navigate = useNavigate();

  const params = new URLSearchParams(location.search || "");
  const method = String(params.get("method") || "").toLowerCase();
  const orderId = params.get("order_id") || "";

  // Replace current history entry to prevent back to checkout
  useEffect(() => {
    window.history.replaceState(null, "", location.pathname + location.search);
  }, [location.pathname, location.search]);

  const isVnpay = method === "vnpay";
  const title = isVnpay ? "Thanh toán thành công! 🎉" : "Đặt hàng thành công! 🎉";
  const description = isVnpay
    ? "Cảm ơn bạn! Thanh toán VNPay đã được xác nhận thành công."
    : "Cảm ơn bạn! Đơn hàng của bạn đã được tạo thành công.";

  return (
    <React.Fragment>
      <Header onOpenOffcanvas={() => setShowOffcanvas(true)} />
      <Offcanvas show={showOffcanvas} onClose={() => setShowOffcanvas(false)} />
      <CheckoutBanner />

      <section className="checkout-area section-space">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="your-order" style={{ textAlign: "center", padding: "40px 30px" }}>
                {/* Success Icon Animation */}
                <div style={{ marginBottom: "25px" }}>
                  <div 
                    style={{
                      width: "100px",
                      height: "100px",
                      margin: "0 auto",
                      backgroundColor: isVnpay ? "#28a745" : "#198754",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 4px 20px rgba(40, 167, 69, 0.3)",
                      animation: "successPulse 0.6s ease-in-out"
                    }}
                  >
                    <svg 
                      width="50" 
                      height="50" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="white" 
                      strokeWidth="3" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                      style={{ animation: "checkMark 0.6s ease-in-out 0.3s both" }}
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                </div>

                <h3 style={{ color: "#333", marginBottom: "15px", fontSize: "28px" }}>
                  {title}
                </h3>
                
                <p style={{ color: "#666", fontSize: "16px", marginBottom: "20px", lineHeight: "1.6" }}>
                  {description}
                </p>

                {orderId ? (
                  <div 
                    style={{ 
                      marginTop: "20px", 
                      padding: "20px",
                      backgroundColor: "#f8f9fa",
                      borderRadius: "8px",
                      border: "1px solid #e9ecef"
                    }}
                  >
                    <div style={{ fontSize: "14px", color: "#6c757d", marginBottom: "5px" }}>
                      Mã đơn hàng
                    </div>
                    <div style={{ fontSize: "24px", fontWeight: "bold", color: "#667eea" }}>
                      #{orderId}
                    </div>
                  </div>
                ) : null}

                {/* Additional Info */}
                <div 
                  style={{ 
                    marginTop: "25px",
                    padding: "15px",
                    backgroundColor: isVnpay ? "#d4edda" : "#fff3cd",
                    borderRadius: "8px",
                    borderLeft: `4px solid ${isVnpay ? "#28a745" : '#ffc107'}`,
                    textAlign: "left"
                  }}
                >
                  <div style={{ fontWeight: "600", color: isVnpay ? "#155724" : "#856404", marginBottom: "8px" }}>
                    {isVnpay ? "✓ Thanh toán đã hoàn tất" : "📧 Email xác nhận đã được gửi"}
                  </div>
                  <div style={{ fontSize: "14px", color: isVnpay ? "#155724" : "#856404" }}>
                    {isVnpay 
                      ? "Chúng tôi đã gửi email xác nhận chi tiết đơn hàng đến địa chỉ email của bạn."
                      : "Vui lòng kiểm tra email để xem chi tiết đơn hàng và hướng dẫn thanh toán khi nhận hàng."
                    }
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="order-button-payment mt-30" style={{ display: "flex", gap: "15px", justifyContent: "center", flexWrap: "wrap" }}>
                  <Link className="fill-btn" to="/" style={{ minWidth: "160px" }}>
                    <span className="fill-btn-inner">
                      <span className="fill-btn-normal">Về trang chủ</span>
                      <span className="fill-btn-hover">Về trang chủ</span>
                    </span>
                  </Link>
                  
                  {orderId ? (
                    <Link 
                      className="fill-btn" 
                      to={`/order-detail/${orderId}`}
                      style={{ 
                        minWidth: "160px",
                        backgroundColor: "#667eea",
                        borderColor: "#667eea"
                      }}
                    >
                      <span className="fill-btn-inner">
                        <span className="fill-btn-normal">Xem chi tiết</span>
                        <span className="fill-btn-hover">Xem chi tiết</span>
                      </span>
                    </Link>
                  ) : null}
                  
                  <Link 
                    className="fill-btn" 
                    to="/buying-history" 
                    style={{ 
                      minWidth: "160px",
                      backgroundColor: "#6c757d",
                      borderColor: "#6c757d"
                    }}
                  >
                    <span className="fill-btn-inner">
                      <span className="fill-btn-normal">Lịch sử đơn hàng</span>
                      <span className="fill-btn-hover">Lịch sử đơn hàng</span>
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Add CSS Animation */}
      <style>{`
        @keyframes successPulse {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        @keyframes checkMark {
          0% {
            stroke-dasharray: 0, 100;
            stroke-dashoffset: 0;
          }
          100% {
            stroke-dasharray: 100, 0;
            stroke-dashoffset: 0;
          }
        }
      `}</style>

      <Footer />
    </React.Fragment>
  );
}

export default OrderSuccessPage;
