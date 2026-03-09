import React from "react";
import img1 from "../../assets/imgs/postbox-01.jpg";
import BlogSideBar from "./blogSideBar";
import CommentBlog from "../comment_feedback/commentBlog.jsx";

export function BlogDetail() {
  return (
    <section className="postbox__area section-space">
      <div className="container">
        <div className="row gy-50">
          <div className="col-xxl-8 col-lg-8">
            <div className="postbox__wrapper theme-bg-2">
              <article className="postbox__item mb-50 transition-3">
                <div className="postbox__thumb w-img mb-30">
                  <a href="blog-details.html">
                    <img src={img1} alt="" />
                  </a>
                </div>
                <div className="postbox__content">
                  <div className="postbox__meta">
                    <span>
                      <a href="#">
                        <svg
                          width="13"
                          height="14"
                          viewBox="0 0 13 14"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M11.6667 13V11.6667C11.6667 10.9594 11.3857 10.2811 10.8856 9.78105C10.3855 9.28095 9.70724 9 9 9H3.66667C2.95942 9 2.28115 9.28095 1.78105 9.78105C1.28095 10.2811 1 10.9594 1 11.6667V13"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M6.33317 6.33333C7.80593 6.33333 8.99984 5.13943 8.99984 3.66667C8.99984 2.19391 7.80593 1 6.33317 1C4.86041 1 3.6665 2.19391 3.6665 3.66667C3.6665 5.13943 4.86041 6.33333 6.33317 6.33333Z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        Viết bởi Alex Manie
                      </a>
                    </span>
                    <span>
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 15 15"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M7.5 14C11.0899 14 14 11.0899 14 7.5C14 3.91015 11.0899 1 7.5 1C3.91015 1 1 3.91015 1 7.5C1 11.0899 3.91015 14 7.5 14Z"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M7.5 3.59961V7.49961L10.1 8.79961"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>{" "}
                      22/07/2024
                    </span>
                    <span>
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 14 14"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M12.9718 6.66668C12.9741 7.54659 12.769 8.4146 12.3732 9.20001C11.9039 10.1412 11.1825 10.9328 10.2897 11.4862C9.39697 12.0396 8.36813 12.3329 7.31844 12.3333C6.4406 12.3356 5.57463 12.13 4.79106 11.7333L1 13L2.26369 9.20001C1.86791 8.4146 1.66281 7.54659 1.6651 6.66668C1.66551 5.61452 1.95815 4.58325 2.51025 3.68838C3.06236 2.79352 3.85211 2.0704 4.79106 1.60002C5.57463 1.20331 6.4406 0.997725 7.31844 1.00002H7.65099C9.03729 1.07668 10.3467 1.66319 11.3284 2.64726C12.3102 3.63132 12.8953 4.94378 12.9718 6.33334V6.66668Z"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      35
                    </span>
                  </div>
                  <h3 className="postbox__title">
                    <a href="blog-details.html">
                      How to Make your Home a Showplace
                    </a>
                  </h3>
                  <div className="postbox__text">
                    <p>
                      Lorem ipsum dolor sit amet consectetur adipiscing elit Ut
                      et massa mi. Aliquam in hendrerit urna. Pellentesque sit
                      amet sapien fringilla, mattis ligula consectetur, ultrices
                      mauris. Maecenas vitae mattis tellus. Nullam quis
                      imperdiet augue. Vestibulum auctor ornare leo, non
                      suscipit magna interdum eu. Curabitur pellentesque nibh
                      nibh, at maximus ante fermentum.
                    </p>
                  </div>
                </div>
              </article>
              <div className="postbox__features">
                <h4 className="postbox__features-title mb-20">
                  Stunning Furniture with Aesthetic Appeal
                </h4>
                <p>
                  Lorem ipsum dolor sit amet consectetur adipiscing elit Ut et
                  massa mi. Aliquam in hendrerit urna. Pellentesque sit amet
                  sapien fringilla, mattis ligula consectetur, ultrices mauris.
                  Maecenas vitae mattis tellus. Nullam quis imperdiet augue.{" "}
                </p>
                <div className="postbox__thumb-wrapper p-relative mt-30 mb-30">
                  <div className="row g-5">
                    <div className="col-lg-6">
                      <div className="postbox__features-thumb w-img">
                        <img src={img1} alt="" />
                      </div>
                    </div>
                    <div className="col-lg-6">
                      <div className="postbox__features-thumb w-img">
                        <img src={img1} alt="" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="features__list">
                  <ul>
                    <li>Reduced symptoms of anxiety and depression.</li>
                    <li>
                      Improved stress management: Mindfulness meditation has
                      been shown.
                    </li>
                    <li>Better emotional regulation: Mindfulness practice.</li>
                    <li>
                      Increased self-awareness: Mindfulness meditation can help
                      individuals.
                    </li>
                  </ul>
                </div>
              </div>
              <div className="postbox__quote mb-35">
                <blockquote>
                  <p>
                    “I try as much as possible to give you a great basic product
                    and what comes out, I feel, is really amazing.”
                  </p>
                  <div className="blog__quote-author d-flex justify-content-end">
                    <div className="quote__author-info">
                      <h4>Keith Griffin</h4>
                      <span>Doctor</span>
                    </div>
                  </div>
                </blockquote>
              </div>
              <div className="postbox__share-wrapper mb-60">
                <div className="row align-items-center">
                  <div className="col-xl-7">
                    <div className="tagcloud tagcloud-sm">
                      <span>Tags:</span>
                      <a href="#">Blog</a>
                      <a href="#">Creative</a>
                      <a href="#">Portfoilo</a>
                      <a href="#">Harry</a>
                    </div>
                  </div>
                  <div className="col-xl-5">
                    <div className="postbox__share text-xl-end">
                      <span>Chia sẻ:</span>
                      <a href="#">
                        <i className="fa-brands fa-linkedin-in"></i>
                      </a>
                      <a href="#">
                        <i className="fab fa-twitter"></i>
                      </a>
                      <a href="#">
                        <i className="fab fa-facebook-f"></i>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
              <CommentBlog />
            </div>
          </div>
          <BlogSideBar />
        </div>
      </div>
    </section>
  );
}
export default BlogDetail;
