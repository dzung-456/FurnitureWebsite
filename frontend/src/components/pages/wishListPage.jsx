import React, { useState } from "react";
import WishListArea from "../wishList/wishListArea.jsx";
import WishListBanner from "../banners/wishlistBanner.jsx";
import Header from "../commons/Header.jsx";
import Footer from "../commons/Footer.jsx";
import Offcanvas from "../commons/OffCanvas.jsx";

export function WishListPage({ showOffcanvas, setShowOffcanvas }) {
  return (
    <React.Fragment>
      <Header onOpenOffcanvas={() => setShowOffcanvas(true)} />
      <Offcanvas show={showOffcanvas} onClose={() => setShowOffcanvas(false)} />
      <WishListBanner />
      <WishListArea />
      <Footer />
    </React.Fragment>
  );
}

export default WishListPage;
