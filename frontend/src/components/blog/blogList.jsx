import React from "react";
import BlogCard from "./blogCard.jsx";

export function BlogList() {
  return (
    <section className="postbox__grid-area section-space">
      <div className="container">
        <div className="row g-4">
          <BlogCard />
          <BlogCard />
          <BlogCard />
          <BlogCard />
          <BlogCard />
          <BlogCard />
          <BlogCard />
        </div>
      </div>
    </section>
  );
}
export default BlogList;
