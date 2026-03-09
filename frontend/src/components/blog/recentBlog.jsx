import React from "react";
import BlogCard from "./blogCard.jsx";

export function RecentBlog() {
  return (
    <section className="blog-area theme-bg-2 section-space">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-xxl-4 col-xl-4 col-lg-4">
            <div className="section-title-wrapper-4 text-center section-title-space">
              <span className="section-subtitle-4 mb-10">Đọc blog</span>
              <h2 className="section-title-4">Blog gần đây</h2>
            </div>
          </div>
        </div>
        <div className="row gy-5">
          <BlogCard />
          <BlogCard />
          <BlogCard />
        </div>
      </div>
    </section>
  );
}
export default RecentBlog;
