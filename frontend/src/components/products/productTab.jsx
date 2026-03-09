import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import reviewService from "../../services/reviewService";

export function ProductTab({ description, productId, productName }) {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);

  const reviewCount = reviews.length;
  const averageRating = useMemo(() => {
    if (!reviews.length) return 0;
    const sum = reviews.reduce((acc, r) => acc + (Number(r.rating) || 0), 0);
    return sum / reviews.length;
  }, [reviews]);

  useEffect(() => {
    let isActive = true;

    const fetchReviews = async () => {
      if (!productId) return;
      setReviewsLoading(true);
      try {
        const res = await reviewService.getProductReviews(productId);
        if (isActive) {
          setReviews(res?.data || []);
        }
      } catch (err) {
        console.error("Failed to fetch reviews", err);
        if (isActive) {
          setReviews([]);
        }
      } finally {
        if (isActive) setReviewsLoading(false);
      }
    };

    fetchReviews();
    return () => {
      isActive = false;
    };
  }, [productId]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!productId || submitLoading) return;

    setSubmitLoading(true);
    try {
      await reviewService.createReview({
        productId,
        rating,
        comment,
      });
      const res = await reviewService.getProductReviews(productId);
      setReviews(res?.data || []);
      setComment("");
      setRating(5);
    } catch (err) {
      if (
        err?.code === "NOT_AUTHENTICATED" ||
        err?.response?.status === 401 ||
        err?.response?.status === 403
      ) {
        navigate("/login");
        return;
      }
      console.error("Failed to submit review", err);
    } finally {
      setSubmitLoading(false);
    }
  };

  const renderStars = (value) => {
    const v = Number(value) || 0;
    return (
      <ul>
        {Array.from({ length: 5 }).map((_, i) => {
          const idx = i + 1;
          return (
            <li key={idx}>
              <a href="#" onClick={(e) => e.preventDefault()}>
                <i className={idx <= v ? "fas fa-star" : "fal fa-star"}></i>
              </a>
            </li>
          );
        })}
      </ul>
    );
  };

  const renderSelectableStars = () => {
    return (
      <ul>
        {Array.from({ length: 5 }).map((_, i) => {
          const idx = i + 1;
          const filled = idx <= rating;
          return (
            <li key={idx}>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setRating(idx);
                }}
              >
                <i className={filled ? "fas fa-star" : "fal fa-star"}></i>
              </a>
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <div className="product__details-additional-info section-space-medium-top">
      <div className="row">
        <div className="col-xxl-3 col-xl-4 col-lg-4">
          <div className="product__details-more-tab mr-15">
            <nav>
              <div
                className="nav nav-tabs flex-column"
                id="productmoretab"
                role="tablist"
              >
                <button
                  className="nav-link active"
                  id="nav-description-tab"
                  data-bs-toggle="tab"
                  data-bs-target="#nav-description"
                  type="button"
                  role="tab"
                  aria-controls="nav-description"
                  aria-selected="true"
                >
                  Mô tả sản phẩm
                </button>
                <button
                  className="nav-link"
                  id="nav-additional-tab"
                  data-bs-toggle="tab"
                  data-bs-target="#nav-additional"
                  type="button"
                  role="tab"
                  aria-controls="nav-additional"
                  aria-selected="false"
                >
                  Thông tin bổ sung
                </button>
                <button
                  className="nav-link"
                  id="nav-review-tab"
                  data-bs-toggle="tab"
                  data-bs-target="#nav-review"
                  type="button"
                  role="tab"
                  aria-controls="nav-review"
                  aria-selected="false"
                >
                  Đánh giá ({reviewsLoading ? "..." : reviewCount})
                </button>
              </div>
            </nav>
          </div>
        </div>
        <div className="col-xxl-9 col-xl-8 col-lg-8">
          <div className="product__details-more-tab-content">
            <div className="tab-content" id="productmorecontent">
              <div
                className="tab-pane fade show active"
                id="nav-description"
                role="tabpanel"
                aria-labelledby="nav-description-tab"
              >
                <div className="product__details-des">
                  {description ? (
                    <p>{description}</p>
                  ) : (
                    <p>Chưa có mô tả cho sản phẩm này.</p>
                  )}
                </div>
              </div>
              <div
                className="tab-pane fade"
                id="nav-additional"
                role="tabpanel"
                aria-labelledby="nav-additional-tab"
              >
                <div className="product__details-info">
                  <ul>
                    <li>
                      <h4>Weight</h4>
                      <span>2 lbs</span>
                    </li>
                    <li>
                      <h4>Dimensions</h4>
                      <span>12 × 16 × 19 in</span>
                    </li>
                    <li>
                      <h4>Product</h4>
                      <span>Purchase this product on rag-bone.com</span>
                    </li>
                    <li>
                      <h4>Color</h4>
                      <span>Gray, Black</span>
                    </li>
                    <li>
                      <h4>Size</h4>
                      <span>S, M, L, XL</span>
                    </li>
                    <li>
                      <h4>Model</h4>
                      <span>Model </span>
                    </li>
                    <li>
                      <h4>Shipping</h4>
                      <span>Standard shipping: $5,95</span>
                    </li>
                    <li>
                      <h4>Care Info</h4>
                      <span>Machine Wash up to 40ºC/86ºF Gentle Cycle</span>
                    </li>
                    <li>
                      <h4>Brand</h4>
                      <span>Kazen</span>
                    </li>
                  </ul>
                </div>
              </div>
              <div
                className="tab-pane fade"
                id="nav-review"
                role="tabpanel"
                aria-labelledby="nav-review-tab"
              >
                <div className="product__details-review">
                  <h3 className="comments-title">
                    {reviewCount} đánh giá cho “{productName || "Sản phẩm"}”
                  </h3>
                  <div className="comments-top d-sm-flex align-items-start justify-content-between mb-20">
                    <div>
                      <div className="user-rating">
                        {renderStars(Math.round(averageRating))}
                      </div>
                      <div className="comments-date">
                        <span>
                          Trung bình:{" "}
                          {averageRating ? averageRating.toFixed(1) : "0.0"}/5
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="latest-comments mb-50">
                    <ul>
                      {reviewsLoading ? (
                        <li>
                          <div className="comments-text">
                            <p>Loading...</p>
                          </div>
                        </li>
                      ) : reviews.length === 0 ? (
                        <li>
                          <div className="comments-text">
                            <p>Chưa có đánh giá nào.</p>
                          </div>
                        </li>
                      ) : (
                        reviews.map((r) => (
                          <li key={r.id}>
                            <div className="comments-box d-flex">
                              <div className="comments-text">
                                <div className="comments-top d-sm-flex align-items-start justify-content-between mb-5">
                                  <div className="avatar-name">
                                    <h5>
                                      {r.username || `User #${r.user_id}`}
                                    </h5>
                                    <div className="comments-date">
                                      <span>
                                        {r.created_at
                                          ? new Date(
                                              r.created_at
                                            ).toLocaleString()
                                          : ""}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="user-rating">
                                    {renderStars(r.rating)}
                                  </div>
                                </div>
                                <p>{r.comment || ""}</p>
                              </div>
                            </div>
                          </li>
                        ))
                      )}
                    </ul>
                  </div>
                  <div className="product__details-comment section-space-medium-bottom">
                    <div className="comment-title mb-20">
                      <h3>Thêm đánh giá</h3>
                    </div>
                    <div className="comment-rating mb-20">
                      <span>Đánh giá tổng thể</span>
                      {renderSelectableStars()}
                    </div>
                    <div className="comment-input-box">
                      <form action="#" onSubmit={handleSubmitReview}>
                        <div className="row">
                          <div className="col-xxl-12">
                            <div className="comment-input">
                              <textarea
                                placeholder="Nhập đánh giá của bạn"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                              ></textarea>
                            </div>
                          </div>
                          <div className="col-xxl-12">
                            <div className="comment-submit">
                              <button
                                type="submit"
                                className="fill-btn"
                                disabled={submitLoading || !productId}
                              >
                                <span className="fill-btn-inner">
                                  <span className="fill-btn-normal">
                                    {submitLoading
                                      ? "Đang gửi..."
                                      : "Gửi đánh giá"}
                                  </span>
                                  <span className="fill-btn-hover">
                                    {submitLoading
                                      ? "Đang gửi..."
                                      : "Gửi đánh giá"}
                                  </span>
                                </span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default ProductTab;
