import React, { useState } from "react";
import Header from "../commons/Header.jsx";
import Footer from "../commons/Footer.jsx";
import Offcanvas from "../commons/OffCanvas.jsx";
import CartBanner from "../banners/cartBanner.jsx";
import Cart from "../cart/cart.jsx";
export function CartPage({ showOffcanvas, setShowOffcanvas }) {
  return (
    <React.Fragment>
      <Header onOpenOffcanvas={() => setShowOffcanvas(true)} />
      <Offcanvas show={showOffcanvas} onClose={() => setShowOffcanvas(false)} />
      <CartBanner />
      <Cart />

      <Footer />
    </React.Fragment>
  );
}
export default CartPage;
