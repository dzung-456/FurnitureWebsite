import React from "react";
import blog1 from "../../assets/imgs/blog-1.jpg";

export function BlogCard() {
  return (
    <div className="col-xl-4 col-lg-6">
      <div className="blog-item theme-bg-2">
        <div className="blog-thumb mb-20 w-img">
          <a href="blog-details.html">
            <img src={blog1} alt="" />
          </a>
        </div>
        <div className="blog-content">
          <div className="postbox__meta mb-15">
            <span>
              <a href="#">Viết bởi Alex Manie</a>
            </span>
            <span>03/01/2025</span>
          </div>
          <h4 className="blog-title">
            <a href="blog-details.html">
              Nội thất tuyệt đẹp với vẻ đẹp thẩm mỹ
            </a>
          </h4>
          <a className="text-btn" href="blog-details.html">
            Đọc thêm
            <span>
              <i className="fa-regular fa-angle-right"></i>
            </span>
          </a>
        </div>
      </div>
    </div>
  );
}
export default BlogCard;
