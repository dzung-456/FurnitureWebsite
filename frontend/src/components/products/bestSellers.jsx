import React, { useEffect, useState } from "react";
import ProductCards from "./productCards";
import productService from "../../services/productService";

export function BestSellers() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    let cancelled = false;

    const fetchBestSellers = async () => {
      try {
        const data = await productService.getBestSellersWeek({ limit: 4 });
        if (!cancelled) setProducts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load best sellers", err);
        if (!cancelled) setProducts([]);
      }
    };

    fetchBestSellers();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="furniture-seller section-space">
      <div className="container">
        <div className="section-title-wrapper-4 mb-40">
          <span className="section-subtitle-4 mb-10">Tuần này</span>
          <h2 className="section-title-4">Bán chạy nhất</h2>
        </div>
        <div className="row g-4">
          {products.slice(0, 4).map((product) => (
            <div key={product.id} className="col-xl-4 col-lg-6 col-md-6">
              <ProductCards product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
export default BestSellers;
