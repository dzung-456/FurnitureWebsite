import React, { useEffect, useState } from "react";
import ProductCards from "./productCards.jsx";
import "../../assets/js/swiper.min.js";
import productService from "../../services/productService";
export function TopSale() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    let cancelled = false;

    const fetchTopSale = async () => {
      try {
        const data = await productService.getBestSellersAllTime({ limit: 4 });
        if (!cancelled) setProducts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load top sale products", err);
        if (!cancelled) setProducts([]);
      }
    };

    fetchTopSale();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    // eslint-disable-next-line no-undef
    new Swiper(".furuniture-active", {
      navigation: {
        nextEl: ".discount-slider-button-next",
        prevEl: ".discount-slider-button-prev",
      },
      slidesPerView: 1,
      loop: true,
    });
  }, []);
  return (
    <section
      className="discount-area p-relative section-space pt-0"
      style={{ marginTop: "0px" }}
    >
      <div className="container">
        <div className="section-title-wrapper-4 mb-40 text-center">
          <span className="section-subtitle-4 mb-10">Bán chạy nhất </span>
          <h2 className="section-title-4">Sản phẩm nổi bật</h2>
        </div>
        <div className="discount-main p-relative">
          <div className="discount-slider-navigation furniture__navigation">
            <button type="button" className="discount-slider-button-prev">
              <i className="fa-regular fa-angle-left"></i>
            </button>
            <button type="button" className="discount-slider-button-next">
              <i className="fa-regular fa-angle-right"></i>
            </button>
          </div>
          <div className="row align-items-center">
            <div className="col-xxl-12">
              <div className="swiper furuniture-active">
                <div className="swiper-wrapper">
                  <div className="swiper-slide">
                    {products.slice(0, 4).map((product) => (
                      <ProductCards key={product.id} product={product} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
export default TopSale;
