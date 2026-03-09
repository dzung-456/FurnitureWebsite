import React from "react";
import bg from "../../assets/imgs/breadcrumb-bg-furniture.jpg";
export function BlogListBanner() {
  return (
    <div className="breadcrumb__area theme-bg-1 p-relative z-index-11 pt-95 pb-95">
      <div
        className="breadcrumb__thumb"
        style={{ backgroundImage: `url(${bg})` }}
      ></div>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-xxl-12">
            <div className="breadcrumb__wrapper text-center">
              <h2 className="breadcrumb__title">Danh sách blog</h2>
              <div className="breadcrumb__menu">
                <nav>
                  <ul>
                    <li>
                      <span>
                        <a href="/">Trang chủ</a>
                      </span>
                    </li>
                    <li>
                      <span>Danh sách blog</span>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default BlogListBanner;
