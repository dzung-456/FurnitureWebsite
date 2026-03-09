import React, { useState } from "react";
import Header from "../commons/Header.jsx";
import Footer from "../commons/Footer.jsx";
import Offcanvas from "../commons/OffCanvas.jsx";
import BlogDetail from "../blog/blogDetail.jsx";
import BlogSideBar from "../blog/blogSideBar.jsx";
import CommentBlog from "../comment_feedback/commentBlog.jsx";

export function BlogDetailPage({ showOffcanvas, setShowOffcanvas }) {
  return (
    <React.Fragment>
      <Header onOpenOffcanvas={() => setShowOffcanvas(true)} />
      <Offcanvas show={showOffcanvas} onClose={() => setShowOffcanvas(false)} />
      <BlogDetail />
      <Footer />
    </React.Fragment>
  );
}
export default BlogDetailPage;
