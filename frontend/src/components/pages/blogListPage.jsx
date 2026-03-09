import React, { useState } from "react";
import Header from "../commons/Header.jsx";
import Footer from "../commons/Footer.jsx";
import Offcanvas from "../commons/OffCanvas.jsx";
import BlogListBanner from "../banners/bloglistBanner.jsx";
import BlogList from "../blog/blogList.jsx";
import Pagination from "../commons/pagination.jsx";

export function BlogListPage({ showOffcanvas, setShowOffcanvas }) {
  return (
    <React.Fragment>
      <Header onOpenOffcanvas={() => setShowOffcanvas(true)} />
      <Offcanvas show={showOffcanvas} onClose={() => setShowOffcanvas(false)} />
      <BlogListBanner />
      <BlogList />
      <Pagination />
      <Footer />
    </React.Fragment>
  );
}
export default BlogListPage;
