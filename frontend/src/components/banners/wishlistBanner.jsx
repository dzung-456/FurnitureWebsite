import React from "react";
import bg from "../../assets/imgs/breadcrumb-bg-furniture.jpg";
import { Link } from "react-router-dom";

export function WishListBanner() {
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
              <h2 className="breadcrumb__title">Danh sách yêu thích</h2>
              <div className="breadcrumb__menu">
                <nav>
                  <ul>
                    <li>
                      <span>
                        <Link to="/">Trang chủ</Link>
                      </span>
                    </li>
                    <li>
                      <span>Danh sách yêu thích</span>
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

export default WishListBanner;
