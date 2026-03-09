import React from "react";
import img1 from "../../assets/imgs/postbox-01.jpg";

export function BlogSideBar() {
  return (
    <div className="col-xxl-4 col-lg-4">
      <div className="sidebar__wrapper bd-sticky pl-30">
        <div className="sidebar__widget mb-20">
          <div className="sidebar__widget-content">
            <div className="sidebar__search">
              <form action="#">
                <div className="sidebar__search-input">
                  <input type="text" placeholder="Enter your keywords..." />
                  <button type="submit">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M9.55 18.1C14.272 18.1 18.1 14.272 18.1 9.55C18.1 4.82797 14.272 1 9.55 1C4.82797 1 1 4.82797 1 9.55C1 14.272 4.82797 18.1 9.55 18.1Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M19.0002 19.0002L17.2002 17.2002"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
        <div className="sidebar__widget mb-45">
          <h3 className="sidebar__widget-title">Danh mục blog</h3>
          <div className="sidebar__widget-content">
            <ul>
              <li>
                <a href="blog.html">
                  Business <span>10</span>
                </a>
              </li>
              <li>
                <a href="blog.html">
                  Cleaning <span>08</span>
                </a>
              </li>
              <li>
                <a href="blog.html">
                  Consultant <span>24</span>
                </a>
              </li>
              <li>
                <a href="blog.html">
                  Creative <span>37</span>
                </a>
              </li>
              <li>
                <a href="blog.html">
                  Technology <span>103</span>
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="sidebar__widget mb-45">
          <h3 className="sidebar__widget-title">Bài viết gần đây</h3>
          <div className="sidebar__widget-content">
            <div className="sidebar__post">
              <div className="rc__post d-flex align-items-center">
                <div className="rc__post-thumb">
                  <a href="blog-details.html">
                    <img src={img1} alt="" />
                  </a>
                </div>
                <div className="rc__post-content">
                  <h4 className="rc__post-title">
                    <a href="blog-details.html">
                      Business meeting 2021 in San Francisco
                    </a>
                  </h4>
                  <div className="rc__meta">
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
                      </svg>
                      21/7/2022
                    </span>
                  </div>
                </div>
              </div>
              <div className="rc__post d-flex align-items-center">
                <div className="rc__post-thumb">
                  <a href="blog-details.html">
                    <img src={img1} alt="" />
                  </a>
                </div>
                <div className="rc__post-content">
                  <h4 className="rc__post-title">
                    <a href="blog-details.html">
                      Developing privacy user-centric apps
                    </a>
                  </h4>
                  <div className="rc__meta">
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
                      </svg>
                      21/7/2022
                    </span>
                  </div>
                </div>
              </div>
              <div className="rc__post d-flex align-items-center">
                <div className="rc__post-thumb">
                  <a href="blog-details.html">
                    <img src={img1} alt="" />
                  </a>
                </div>
                <div className="rc__post-content">
                  <h4 className="rc__post-title">
                    <a href="blog-details.html">
                      Starting and Growing Web Design in 2022
                    </a>
                  </h4>
                  <div className="rc__meta">
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
                      </svg>
                      21/7/2022
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="sidebar__widget">
          <h3 className="sidebar__widget-title">Tags</h3>
          <div className="sidebar__widget-content">
            <div className="tagcloud">
              <a href="#">Techology</a>
              <a href="#">Food</a>
              <a href="#">Personality</a>
              <a href="#">Life Style</a>
              <a href="#">Travel</a>
              <a href="#">Nature</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default BlogSideBar;
