import React from "react";
import logofooter from "../../assets/imgs/logo-light.png";
import payment1 from "../../assets/imgs/payoneer.png";
import payment2 from "../../assets/imgs/maser.png";
import payment3 from "../../assets/imgs/paypal.png";
export function Footer() {
  return (
    <footer className="footer-bg">
      <div className="footer-area pt-100 pb-20">
        <div className="footer-style-4">
          <div className="container">
            <div className="footer-grid-3">
              <div className="footer-widget-4">
                <div className="footer-logo mb-35">
                  <a href="index.html">
                    <img src={logofooter} alt="image bnot found" />
                  </a>
                </div>
                <p>
                  {" "}
                  Chúng tôi mang đến những giải pháp nội thất hiện đại, tinh tế,
                  giúp nâng tầm không gian sống, tạo cảm hứng cho mỗi ngôi nhà.
                </p>
                <div className="theme-social">
                  <a className="furniture-bg-hover" href="#">
                    <i className="fa-brands fa-facebook-f"></i>
                  </a>
                  <a className="furniture-bg-hover" href="#">
                    <i className="fa-brands fa-twitter"></i>
                  </a>
                  <a className="furniture-bg-hover" href="#">
                    <i className="fa-brands fa-linkedin-in"></i>
                  </a>
                  <a className="furniture-bg-hover" href="#">
                    <i className="fa-brands fa-instagram"></i>
                  </a>
                </div>
              </div>
              <div className="footer-widget-4">
                <div className="footer-widget-title">
                  <h4>Dịch vụ</h4>
                </div>
                <div className="footer-link" style={{ fontSize: "16px" }}>
                  <ul>
                    <li>
                      <a href="error.html">Đăng nhập</a>
                    </li>
                    <li>
                      <a href="wishlist.html">Danh sách yêu thích</a>
                    </li>
                    <li>
                      <a href="error.html">Chính sách đổi trả</a>
                    </li>
                    <li>
                      <a href="error.html">Chính sách bảo mật</a>
                    </li>
                    <li>
                      <a href="faq.html">Câu hỏi thường gặp</a>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="footer-widget-4">
                <div className="footer-widget-title">
                  <h4>Công ty</h4>
                </div>
                <div className="footer-link" style={{ fontSize: "16px" }}>
                  <ul>
                    <li>
                      <a href="index.html">Trang chủ</a>
                    </li>
                    <li>
                      <a href="about.html">Về chúng tôi</a>
                    </li>
                    <li>
                      <a href="about.html">Trang</a>
                    </li>

                    <li>
                      <a href="contact.html">Liên hệ</a>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="footer-widget footer-col-4">
                <div className="footer-widget-title">
                  <h4>Liên hệ</h4>
                </div>
                <div className="footer-info mb-35">
                  <div className="footer-info-item d-flex align-items-start pb-15 pt-15">
                    <div className="footer-info-icon mr-20">
                      <span>
                        {" "}
                        <i className="fa-solid fa-location-dot furniture-icon"></i>
                      </span>
                    </div>
                    <div className="footer-info-text">
                      <a
                        className="furniture-clr-hover"
                        target="_blank"
                        href="https://maps.app.goo.gl/5hrtE6C6XX5fqrnV9"
                      >
                        48 Cao Thắng, Hải Châu, Đà Nẵng, Việt Nam
                      </a>
                    </div>
                  </div>
                  <div className="footer-info-item d-flex align-items-start">
                    <div className="footer-info-icon mr-20">
                      <span>
                        <i className="fa-solid fa-phone furniture-icon"></i>
                      </span>
                    </div>
                    <div className="footer-info-text">
                      <a
                        className="furniture-clr-hover"
                        href="tel:012-345-6789"
                      >
                        Liên hệ: 0795605214
                      </a>
                      <p>Thứ Hai - Thứ Bảy: 9 AM - 5 PM</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="container">
        <div className="footer-copyright-area b-t">
          <div className="footer-copyright-wrapper">
            <div className="footer-copyright-text">
              <p className="mb-0">
                © All Copyright 2025 by{" "}
                <a target="_blank" className="furniture-clr-hover" href="#">
                  FurniDev
                </a>
              </p>
            </div>
            <div className="footer-payment d-flex align-items-center gap-2">
              <div className="footer-payment-item mb-0">
                <div className="footer-payment-thumb">
                  <img src={payment1} alt="" />
                </div>
              </div>
              <div className="footer-payment-item mb-0">
                <div className="footer-payment-thumb">
                  <img src={payment2} alt="" />
                </div>
              </div>
              <div className="footer-payment-item">
                <div className="footer-payment-thumb">
                  <img src={payment3} alt="" />
                </div>
              </div>
            </div>
            <div className="footer-conditions">
              <ul>
                <li>
                  <a className="furniture-clr-hover" href="#">
                    Terms & Condition
                  </a>
                </li>
                <li>
                  <a className="furniture-clr-hover" href="#">
                    Privacy Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
export default Footer;
