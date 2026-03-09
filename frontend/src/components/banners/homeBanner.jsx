import React, { useEffect } from "react";
import chair1 from "../../assets/imgs/chair1.png";
import chair2 from "../../assets/imgs/chair2.png";
import chair3 from "../../assets/imgs/chair3.png";
import circle from "../../assets/imgs/circle.png";

export function HomeBanner() {
  return (
    <section
      className="banner-4 p-relative furniture-banner-area fix bg-image pb-100"
      data-background="assets/imgs/furniture/banner/bg.png"
      data-bg-color="#F5F1E6"
    >
      <div className="swiper banner-active">
        <div className="swiper-wrapper">
          <div className="swiper-slide">
            <div className="banner-item-4 d-flex align-items-end">
              <div className="container">
                <div className="row g-5 align-self-end">
                  <div className="col-xxl-6 col-lg-6">
                    <div className="banner-content-4 furniture__content">
                      <span>Hàng mới về ...</span>
                      <h2 className="banner-title-4">
                        Nâng tầm <br /> thẩm mỹ cho nhà của bạn
                      </h2>
                      <p>
                        Mang đến giải pháp nội thất hài hòa giữa công năng và
                        thẩm mỹ, giúp nhà của bạn trở thành nơi bạn luôn muốn
                        quay về.
                      </p>
                      <div className="banner-btn-wrapper furniture__btn-group">
                        <a className="solid-btn" href="/productsList">
                          Mua ngay
                          <span>
                            <i className="fa-regular fa-angle-right"></i>
                          </span>
                        </a>
                        <a className="border__btn-banner" href="/productsList">
                          Xem chi tiết
                          <span>
                            <i className="fa-regular fa-angle-right"></i>
                          </span>
                        </a>
                      </div>
                    </div>
                  </div>
                  <div className="col-xxl-6 col-lg-6">
                    <div className="banner-thumb-wrapper-4 p-relative">
                      <div className="banner-thumb-4 p-relative z-index-1">
                        <img src={chair1} alt="image" />
                      </div>
                      <div className="furniture-circle d-none d-lg-block">
                        <img src={circle} alt="" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="swiper-slide">
            <div className="banner-item-4 d-flex align-items-end">
              <div className="container">
                <div className="row g-5 align-self-end">
                  <div className="col-xxl-6 col-lg-6">
                    <div className="banner-content-4 furniture__content">
                      <span>New Arrival...</span>
                      <h2 className="banner-title-4">
                        Nâng tầm <br /> thẩm mỹ cho ngôi nhà của bạn
                      </h2>
                      <p>
                        A furniture e-commerce company operates in the digital
                        space, offering a wide range of furniture products for
                        sale through an online platform.
                      </p>
                      <div className="banner-btn-wrapper furniture__btn-group">
                        <a className="solid-btn" href="/productsList">
                          Mua ngay
                          <span>
                            <i className="fa-regular fa-angle-right"></i>
                          </span>
                        </a>
                        <a className="border__btn-banner" href="/productsList">
                          Xem chi tiết
                          <span>
                            <i className="fa-regular fa-angle-right"></i>
                          </span>
                        </a>
                      </div>
                    </div>
                  </div>
                  <div className="col-xxl-6 col-lg-6">
                    <div className="banner-thumb-wrapper-4 p-relative">
                      <div className="banner-thumb-4 p-relative z-index-1">
                        <img src={chair2} alt="image" />
                      </div>
                      <div className="furniture-circle d-none d-lg-block">
                        <img src={circle} alt="" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="swiper-slide">
            <div className="banner-item-4 d-flex align-items-end">
              <div className="container">
                <div className="row g-5 align-self-end">
                  <div className="col-xxl-6 col-lg-6">
                    <div className="banner-content-4 furniture__content">
                      <span>New Arrival...</span>
                      <h2 className="banner-title-4">
                        Nâng tầm <br /> thẩm mỹ cho ngôi nhà của bạn
                      </h2>
                      <p>
                        A furniture e-commerce company operates in the digital
                        space, offering a wide range of furniture products for
                        sale through an online platform.
                      </p>
                      <div className="banner-btn-wrapper furniture__btn-group">
                        <a className="solid-btn" href="/productsList">
                          Mua ngay
                          <span>
                            <i className="fa-regular fa-angle-right"></i>
                          </span>
                        </a>
                        <a className="border__btn-banner" href="/productsList">
                          Xem chi tiết
                          <span>
                            <i className="fa-regular fa-angle-right"></i>
                          </span>
                        </a>
                      </div>
                    </div>
                  </div>
                  <div className="col-xxl-6 col-lg-6">
                    <div className="banner-thumb-wrapper-4 p-relative">
                      <div className="banner-thumb-4 p-relative z-index-1">
                        <img src={chair3} alt="image" />
                      </div>
                      <div className="furniture-circle d-none d-lg-block">
                        <img src={circle} alt="" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* <!-- If we need pagination --> */}
        <div className="banner-dot-inner">
          <div className="banner-dot"></div>
        </div>
      </div>
    </section>
  );
}
export default HomeBanner;
