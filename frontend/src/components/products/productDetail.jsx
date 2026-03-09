import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import productService from "../../services/productService";
import categoryService from "../../services/categoryService";
import wishlistService from "../../services/wishlistService";
import cartService from "../../services/cartService";
import detail1 from "../../assets/imgs/details-04.png";
import ProductTab from "./productTab";

export function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [categoryName, setCategoryName] = useState("");
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [cartLoading, setCartLoading] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await productService.getProductById(id);
        setProduct(data);
      } catch (error) {
        console.error("Failed to fetch product", error);
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      fetchProduct();
    }
  }, [id]);

  useEffect(() => {
    setQuantity(1);
    setCartLoading(false);
  }, [product?.id]);

  useEffect(() => {
    let isActive = true;

    const fetchCategoryName = async (categoryId) => {
      setCategoryLoading(true);
      try {
        const category = await categoryService.getCategoryById(categoryId);
        if (isActive) {
          setCategoryName(category?.name || "");
        }
      } catch (error) {
        console.error("Failed to fetch category", error);
        if (isActive) {
          setCategoryName("");
        }
      } finally {
        if (isActive) {
          setCategoryLoading(false);
        }
      }
    };

    if (product?.category_id) {
      fetchCategoryName(product.category_id);
    } else {
      setCategoryName("");
      setCategoryLoading(false);
    }

    return () => {
      isActive = false;
    };
  }, [product?.category_id]);

  useEffect(() => {
    if (product?.id) {
      setWishlisted(wishlistService.isWishlisted(product.id));
    } else {
      setWishlisted(false);
    }
  }, [product?.id]);

  useEffect(() => {
    const refresh = () => {
      if (product?.id) {
        setWishlisted(wishlistService.isWishlisted(product.id));
      } else {
        setWishlisted(false);
      }
    };

    window.addEventListener("wishlist:updated", refresh);
    window.addEventListener("auth:changed", refresh);
    return () => {
      window.removeEventListener("wishlist:updated", refresh);
      window.removeEventListener("auth:changed", refresh);
    };
  }, [product?.id]);

  if (loading) return <div>Loading...</div>;
  if (!product) return <div>Product not found</div>;

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
    const raw = e.target.value.replace(/\D/g, "");
    setQuantity(raw ? parseInt(raw, 10) : "");
  };

  const handleMinus = (e) => {
    e.preventDefault();
    setQuantity((prev) => {
      const current = Number(prev) || 1;
      return current > 1 ? current - 1 : 1;
    });
  };

  const handlePlus = (e) => {
    e.preventDefault();
    setQuantity((prev) => {
      const current = Number(prev) || 0;
      return current ? current + 1 : 1;
    });
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

  return (
    <div className="product__details-area section-space-medium">
      <div className="container">
        <div className="row align-items-center">
          <div className="col-xxl-6 col-lg-6">
            <div className="product__details-thumb-wrapper d-sm-flex align-items-start mr-50">
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
                      <img
                        src={
                          product?.image
                            ? `/uploads/products/${product.image}`
                            : detail1
                        }
                        alt="product-sm-thumb"
                      />
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
                      <img
                        src={
                          product?.image
                            ? `/uploads/products/${product.image}`
                            : detail1
                        }
                        alt=""
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-xxl-6 col-lg-6">
            <div className="product__details-content pr-80">
              <div className="product__details-top d-sm-flex align-items-center mb-15">
                {/* <div className="product__details-tag mr-10">
                  <a href="#">Construction</a>
                </div> */}
                {/* <div className="product__details-rating mr-10">
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
                    <i className="fa-regular fa-star"></i>
                  </a>
                </div> */}
                {/* <div className="product__details-review-count">
                  <a href="#">10 Đánh giá</a>
                </div> */}
              </div>
              <h3 className="product__details-title text-capitalize">
                {product?.name}
              </h3>
              <div className="product__details-price">
                <span className="old-price">
                  {product?.price?.toLocaleString()}₫
                </span>
                <span className="new-price">
                  {product?.sale_price > 0
                    ? product.sale_price.toLocaleString()
                    : product?.price?.toLocaleString()}
                  ₫
                </span>
              </div>
              <p>{product?.short_description || product?.description}</p>

              <div className="product__details-action mb-35">
                <div className="product__quantity">
                  <div className="product-quantity-wrapper">
                    <form action="#">
                      <button
                        type="button"
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
                        type="button"
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
                        {cartLoading ? "Đang thêm..." : "Thêm vào giỏ"}
                        <i className="fa-solid fa-basket-shopping"></i>
                      </span>
                      <span className="fill-btn-hover">
                        {cartLoading ? "Đang thêm..." : "Thêm vào giỏ"}
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
                        wishlisted ? "fa-solid fa-heart" : "fa-regular fa-heart"
                      }
                    ></i>
                  </a>
                </div>
              </div>
              <div className="product__details-meta mb-20">
                <div className="sku">
                  <span>SKU:</span>
                  <a href="#">{product?.id}</a>
                </div>
                <div className="categories">
                  <span>Danh mục:</span>{" "}
                  <a href="#">
                    {product?.category_id
                      ? categoryLoading
                        ? "Loading..."
                        : categoryName || "Chưa phân loại"
                      : "Chưa phân loại"}
                  </a>
                </div>
                <div className="tag">
                  <span>Tags:</span> <span>{product?.tags}</span>
                </div>
              </div>
              <div className="product__details-share">
                <span>Chia sẻ:</span>
                <a href="#">
                  <i className="fa-brands fa-facebook-f"></i>
                </a>
                <a href="#">
                  <i className="fa-brands fa-twitter"></i>
                </a>
                <a href="#">
                  <i className="fa-brands fa-behance"></i>
                </a>
                <a href="#">
                  <i className="fa-brands fa-youtube"></i>
                </a>
                <a href="#">
                  <i className="fa-brands fa-linkedin-in"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
        <ProductTab
          description={product?.description}
          productId={product?.id}
          productName={product?.name}
        />
      </div>
    </div>
  );
}
export default ProductDetail;
