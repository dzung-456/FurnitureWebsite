import React, { useEffect, useMemo, useState } from "react";
import ProductCards from "./productCards";
import productService from "../../services/productService";
import Pagination from "../commons/pagination";
import categoryService from "../../services/categoryService";
export function ProductsList() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [ratingMin, setRatingMin] = useState(0);
  const [priceMin, setPriceMin] = useState(0);
  const [priceMax, setPriceMax] = useState(0);
  const pageSize = 8;

  const normalizeText = (value) => {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "d")
      .toLowerCase()
      .trim();
  };

  useEffect(() => {
    const load = async () => {
      try {
        const data = await productService.getAllProducts();
        setProducts(Array.isArray(data) ? data : []);
      } catch (e) {
        setProducts([]);
      }
    };
    load();
  }, []);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await categoryService.getAllCategories();
        setCategories(Array.isArray(data) ? data : []);
      } catch (e) {
        setCategories([]);
      }
    };
    loadCategories();
  }, []);

  const maxAvailablePrice = useMemo(() => {
    const prices = products
      .map((p) => {
        const effective =
          Number(p?.sale_price) > 0 ? Number(p?.sale_price) : Number(p?.price);
        return Number.isFinite(effective) ? effective : 0;
      })
      .filter((v) => v >= 0);
    return prices.length ? Math.max(...prices) : 0;
  }, [products]);

  useEffect(() => {
    // Init price range based on loaded products
    setPriceMin(0);
    setPriceMax(maxAvailablePrice);
  }, [maxAvailablePrice]);

  const filteredProducts = useMemo(() => {
    const term = normalizeText(searchTerm);
    if (!term) return products;
    return products.filter((p) => normalizeText(p?.name).includes(term));
  }, [products, searchTerm]);

  const fullyFilteredProducts = useMemo(() => {
    const categoryId = selectedCategoryId ? Number(selectedCategoryId) : null;
    const min = Number(priceMin);
    const max = Number(priceMax);
    const minRating = Number(ratingMin) || 0;

    return filteredProducts.filter((p) => {
      if (categoryId && Number(p?.category_id) !== categoryId) return false;

      const effectivePrice =
        Number(p?.sale_price) > 0 ? Number(p?.sale_price) : Number(p?.price);
      if (Number.isFinite(min) && effectivePrice < min) return false;
      if (Number.isFinite(max) && effectivePrice > max) return false;

      const avg = Number(p?.average_rating) || 0;
      if (minRating > 0 && avg < minRating) return false;

      return true;
    });
  }, [filteredProducts, selectedCategoryId, priceMin, priceMax, ratingMin]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategoryId, priceMin, priceMax, ratingMin]);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(fullyFilteredProducts.length / pageSize));
  }, [fullyFilteredProducts.length]);

  const pagedProducts = useMemo(() => {
    const safePage = Math.min(Math.max(1, currentPage), totalPages);
    const start = (safePage - 1) * pageSize;
    return fullyFilteredProducts.slice(start, start + pageSize);
  }, [fullyFilteredProducts, currentPage, totalPages]);

  return (
    <section className="bd-product__area section-space">
      <div className="container">
        <div className="row">
          <div className="col-xxl-4 col-xl-4 col-lg-4 col-md-6">
            <div className="bd-product__result mb-30">
              <h4>{fullyFilteredProducts.length} Sản phẩm trong danh sách</h4>
            </div>
          </div>
          <div className="col-xxl-8 col-xl-8 col-lg-8 col-md-6">
            <div className="product__filter-wrapper d-flex flex-wrap gap-3 align-items-center justify-content-md-end mb-30">
              <div className="bd-product__filter-btn">
                <button
                  type="button"
                  onClick={() => setFiltersOpen((v) => !v)}
                  aria-expanded={filtersOpen}
                >
                  <i className="fa-solid fa-list"></i> Lọc
                </button>
              </div>
              <div className="header-search">
                <input
                  type="text"
                  placeholder="Tìm kiếm sản phẩm..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button type="button" aria-label="Tìm kiếm">
                  <i className="fa-solid fa-magnifying-glass"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        {filtersOpen && (
          <div className="row mb-30">
            <div className="col-12">
              <div className="p-3 border" style={{ borderRadius: 8 }}>
                <div className="row g-3 align-items-end">
                  <div className="col-12 col-md-4">
                    <label className="form-label">Danh mục</label>
                    <select
                      className="form-select"
                      value={selectedCategoryId}
                      onChange={(e) => setSelectedCategoryId(e.target.value)}
                    >
                      <option value="">Tất cả</option>
                      {categories.map((c) => (
                        <option key={c?.id} value={c?.id}>
                          {c?.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-12 col-md-5">
                    <label className="form-label">Giá (khoảng)</label>
                    <div className="d-flex gap-3 align-items-center">
                      <div style={{ flex: 1 }}>
                        <small className="d-block mb-1">
                          Từ: {Number(priceMin || 0).toLocaleString()}₫
                        </small>
                        <input
                          type="range"
                          className="form-range"
                          min={0}
                          max={maxAvailablePrice}
                          step={1000}
                          value={Math.min(
                            Number(priceMin) || 0,
                            Number(priceMax) || 0
                          )}
                          onChange={(e) => {
                            const next = Number(e.target.value) || 0;
                            setPriceMin(Math.min(next, Number(priceMax) || 0));
                          }}
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <small className="d-block mb-1">
                          Đến: {Number(priceMax || 0).toLocaleString()}₫
                        </small>
                        <input
                          type="range"
                          className="form-range"
                          min={0}
                          max={maxAvailablePrice}
                          step={1000}
                          value={Math.max(
                            Number(priceMax) || 0,
                            Number(priceMin) || 0
                          )}
                          onChange={(e) => {
                            const next = Number(e.target.value) || 0;
                            setPriceMax(Math.max(next, Number(priceMin) || 0));
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="col-12 col-md-3">
                    <label className="form-label">Số sao</label>
                    <select
                      className="form-select"
                      value={ratingMin}
                      onChange={(e) =>
                        setRatingMin(Number(e.target.value) || 0)
                      }
                    >
                      <option value={0}>Tất cả</option>
                      <option value={5}>Từ 5 sao</option>
                      <option value={4}>Từ 4 sao</option>
                      <option value={3}>Từ 3 sao</option>
                      <option value={2}>Từ 2 sao</option>
                      <option value={1}>Từ 1 sao</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="row">
          <div className="col-xxl-12">
            <div className="product__filter-tab">
              <div className="tab-content" id="nav-tabContent">
                <div
                  className="tab-pane fade active show"
                  id="nav-grid"
                  role="tabpanel"
                  aria-labelledby="nav-grid-tab"
                >
                  <div className="row g-5">
                    {pagedProducts.map((product) => (
                      <div
                        key={product?.id || product?.name}
                        className="col-xxl-3 col-xl-3 col-lg-4 col-md-6 col-sm-6"
                      >
                        <ProductCards product={product} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <br />
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </section>
  );
}
export default ProductsList;
