import React from "react";
import ProductCards from "./productCards";

export function TrendyCollection() {
  return (
    <section className="fruniture-trendy section-space">
      <div className="container">
        <div className="furniture-trendy__header">
          <div className="section-title-wrapper-4 mb-40">
            <span className="section-subtitle-4 mb-10">Tháng này</span>
            <h2 className="section-title-4">Bộ sưu tập thịnh hành</h2>
          </div>
          <div
            className="bd-product__filter-style furniture-trendy__tab nav nav-tabs"
            role="tablist"
          >
            <button
              className="nav-link active"
              id="collection-tab"
              data-bs-toggle="tab"
              data-bs-target="#collection"
              type="button"
              role="tab"
              aria-selected="false"
            >
              Tất cả bộ sưu tập
            </button>
            <button
              className="nav-link"
              id="new-tab"
              data-bs-toggle="tab"
              data-bs-target="#new"
              type="button"
              role="tab"
              aria-selected="true"
            >
              Hàng mới về
            </button>
            <button
              className="nav-link"
              id="top-tab"
              data-bs-toggle="tab"
              data-bs-target="#top"
              type="button"
              role="tab"
              aria-selected="true"
            >
              Đánh giá cao
            </button>
          </div>
        </div>
        <div className="product__filter-tab">
          <div className="tab-content" id="nav-tabContent">
            <div
              className="tab-pane fade active show"
              id="collection"
              role="tabpanel"
              aria-labelledby="collection-tab"
            >
              <div className="row g-4">
                <div className="col-xxl-3 col-lg-3 col-md-4 col-sm-6 col-6">
                  <ProductCards />
                </div>
                <div className="col-xxl-3 col-lg-3 col-md-4 col-sm-6 col-6">
                  <ProductCards />
                </div>
                <div className="col-xxl-3 col-lg-3 col-md-4 col-sm-6 col-6">
                  <ProductCards />
                </div>
                <div className="col-xxl-3 col-lg-3 col-md-4 col-sm-6 col-6">
                  <ProductCards />
                </div>
                <div className="col-xxl-3 col-lg-3 col-md-4 col-sm-6 col-6">
                  <ProductCards />
                </div>
              </div>
            </div>

            <div
              className="tab-pane fade"
              id="new"
              role="tabpanel"
              aria-labelledby="new-tab"
            >
              <div className="row g-4">
                <div className="col-xxl-3 col-lg-3 col-md-4 col-sm-6 col-6">
                  <ProductCards />
                </div>
                <div className="col-xxl-3 col-lg-3 col-md-4 col-sm-6 col-6">
                  <ProductCards />
                </div>
              </div>
            </div>

            <div
              className="tab-pane fade"
              id="top"
              role="tabpanel"
              aria-labelledby="top-tab"
            >
              <div className="row g-4">
                <div className="col-xxl-3 col-lg-3 col-md-4 col-sm-6 col-6">
                  <ProductCards />
                </div>
                <div className="col-xxl-3 col-lg-3 col-md-4 col-sm-6 col-6">
                  <ProductCards />
                </div>
                <div className="col-xxl-3 col-lg-3 col-md-4 col-sm-6 col-6">
                  <ProductCards />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
export default TrendyCollection;
