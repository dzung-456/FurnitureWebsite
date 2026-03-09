import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import wishlistService from "../../services/wishlistService";
import cartService from "../../services/cartService";

export const ProductCardQuickView = ({ product, onClose }) => {
  const [quantity, setQuantity] = useState(1);
  const [wishlisted, setWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);
  const navigate = useNavigate();

  // Reset quantity when product changes
  useEffect(() => {
    setQuantity(1);
    setWishlisted(
      product?.id ? wishlistService.isWishlisted(product.id) : false
    );
    setWishlistLoading(false);
    setCartLoading(false);
  }, [product]);

  useEffect(() => {
    const refresh = () => {
      setWishlisted(
        product?.id ? wishlistService.isWishlisted(product.id) : false
      );
    };

    window.addEventListener("wishlist:updated", refresh);
    window.addEventListener("auth:changed", refresh);
    return () => {
      window.removeEventListener("wishlist:updated", refresh);
      window.removeEventListener("auth:changed", refresh);
    };
  }, [product?.id]);

  const handleAddToWishlist = async (e) => {
    e.preventDefault();
    if (!product?.id || wishlistLoading || wishlisted) return;

    setWishlistLoading(true);
    try {
      await wishlistService.addToWishlist(product.id);
      setWishlisted(true);
    } catch (err) {
      if (err?.code === "NOT_AUTHENTICATED") {
        navigate("/login");
        return;
      }
      if (err?.response?.data?.message === "Product already in wishlist") {
        wishlistService.markWishlisted(product.id);
        setWishlisted(true);
        return;
      }
      console.error("Failed to add to wishlist", err);
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleQuantityChange = (e) => {
    const val = e.target.value.replace(/\D/g, "");
    setQuantity(val ? parseInt(val) : "");
  };

  const handleMinus = (e) => {
    e.preventDefault();
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));
  };

  const handlePlus = (e) => {
    e.preventDefault();
    setQuantity((prev) => (prev ? prev + 1 : 1));
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!product?.id || cartLoading) return;

    setCartLoading(true);
    try {
      await cartService.addItem(product.id, quantity || 1);
    } catch (err) {
      if (err?.code === "NOT_AUTHENTICATED") {
        navigate("/login");
        return;
      }
      console.error("Failed to add to cart", err);
    } finally {
      setCartLoading(false);
    }
  };

  if (!product) return null;

  // Calculate discount
  const hasDiscount =
    product.sale_price > 0 && product.sale_price < product.price;

  // Image path
  const imageUrl = product.image
    ? `/uploads/products/${product.image}`
    : "assets/imgs/product1.png";

  return createPortal(
    <div
      className="product-modal-sm modal show"
      style={{
        display: "block",
        background: "rgba(0,0,0,0.5)",
        position: "fixed",
        zIndex: 1050,
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
      }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="product-modal">
            <div className="product-modal-wrapper p-relative">
              <button
                type="button"
                className="close product-modal-close"
                aria-label="Close"
                onClick={onClose}
              >
                <i className="fal fa-times"></i>
              </button>
              <div className="modal__inner">
                <div className="bd__shop-details-inner">
                  <div className="row">
                    <div className="col-xxl-6 col-lg-6">
                      <div className="product__details-thumb-wrapper d-sm-flex align-items-start">
                        {/* Thumbnail tabs removed as we only have 1 image for now */}
                        <div className="product__details-thumb-tab mr-20">
                          <nav>
                            <div
                              className="nav nav-tabs flex-nowrap flex-sm-column"
                              id="nav-tab"
                              role="tablist"
                            >
                              <button
                                className="nav-link active"
                                id="img-1-tab"
                                data-bs-toggle="tab"
                                data-bs-target="#img-1"
                                type="button"
                                role="tab"
                                aria-controls="img-1"
                                aria-selected="true"
                              >
                                <img src={imageUrl} alt={product.name} />
                              </button>
                            </div>
                          </nav>
                        </div>
                        <div className="product__details-thumb-tab-content">
                          <div className="tab-content" id="productthumbcontent">
                            <div
                              className="tab-pane fade show active"
                              id="img-1"
                              role="tabpanel"
                              aria-labelledby="img-1-tab"
                            >
                              <div className="product__details-thumb-big w-img">
                                <img src={imageUrl} alt={product.name} />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-xxl-6 col-lg-6">
                      <div className="product__details-content">
                        <div className="product__details-top d-flex flex-wrap gap-3 align-items-center mb-15">
                          {/* <div className="product__details-tag">
                            <a href="#">Construction</a>
                          </div> */}
                          {/* <div className="product__details-rating">
                            <a href="#">
                              <i className="fa-solid fa-star"></i>
                            </a>
                            <a href="#">
                              <i className="fa-solid fa-star"></i>
                            </a>
                            <a href="#">
                              <i className="fa-solid fa-star"></i>
                            </a>
                            <a href="#">
                              <i className="fa-solid fa-star"></i>
                            </a>
                            <a href="#">
                              <i className="fa-solid fa-star"></i>
                            </a>
                          </div>
                          <div className="product__details-review-count">
                            <a href="#">0 Đánh giá</a>
                          </div> */}
                        </div>
                        <h3 className="product__details-title">
                          {product.name}
                        </h3>
                        <div className="product__details-price">
                          {hasDiscount && (
                            <span className="old-price">
                              {product.price.toLocaleString("vi-VN")}₫
                            </span>
                          )}
                          <span className="new-price">
                            {(hasDiscount
                              ? product.sale_price
                              : product.price
                            ).toLocaleString("vi-VN")}
                            ₫
                          </span>
                        </div>
                        <p>
                          {product.short_description || product.description}
                        </p>

                        <div className="product__details-action mb-35">
                          <div className="product__quantity">
                            <div className="product-quantity-wrapper">
                              <form action="#">
                                <button
                                  className="cart-minus"
                                  onClick={handleMinus}
                                >
                                  <i className="fa-light fa-minus"></i>
                                </button>
                                <input
                                  className="cart-input"
                                  type="text"
                                  value={quantity}
                                  onChange={handleQuantityChange}
                                />
                                <button
                                  className="cart-plus"
                                  onClick={handlePlus}
                                >
                                  <i className="fa-light fa-plus"></i>
                                </button>
                              </form>
                            </div>
                          </div>
                          <div className="product__add-cart">
                            <a
                              href="javascript:void(0)"
                              className="fill-btn cart-btn"
                              onClick={handleAddToCart}
                              aria-disabled={cartLoading}
                            >
                              <span className="fill-btn-inner">
                                <span className="fill-btn-normal">
                                  {cartLoading
                                    ? "Đang thêm..."
                                    : "Thêm vào giỏ"}
                                  <i className="fa-solid fa-basket-shopping"></i>
                                </span>
                                <span className="fill-btn-hover">
                                  {cartLoading
                                    ? "Đang thêm..."
                                    : "Thêm vào giỏ"}
                                  <i className="fa-solid fa-basket-shopping"></i>
                                </span>
                              </span>
                            </a>
                          </div>
                          <div className="product__add-wish">
                            <a
                              href="#"
                              className="product__add-wish-btn"
                              onClick={handleAddToWishlist}
                              aria-disabled={wishlistLoading}
                              title={
                                wishlisted
                                  ? "Đã thêm yêu thích"
                                  : wishlistLoading
                                    ? "Đang thêm..."
                                    : "Thêm vào yêu thích"
                              }
                            >
                              <i
                                className={
                                  wishlisted
                                    ? "fa-solid fa-heart"
                                    : "fa-regular fa-heart"
                                }
                              ></i>
                            </a>
                          </div>
                        </div>
                        <div className="product__details-meta">
                          {/* <div className="sku">
                            <span>SKU:</span>
                            <a href="#">BO1D0MX8SJ</a>
                          </div> */}
                          {/* <div className="categories">
                            <span>Danh mục:</span> <a href="#">Milk,</a>
                            <a href="#">Cream,</a> <a href="#">Fermented.</a>
                          </div> */}
                          <div className="tag">
                            <span>Tags:</span> <span>{product.tags}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
export default ProductCardQuickView;
