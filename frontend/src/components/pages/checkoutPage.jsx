import React, { useState } from "react";
import Header from "../commons/Header.jsx";
import Footer from "../commons/Footer.jsx";
import Offcanvas from "../commons/OffCanvas.jsx";
import CheckoutBanner from "../banners/checkoutBanner.jsx";
import Checkout from "../checkout/checkout.jsx";
export function CheckoutPage({ showOffcanvas, setShowOffcanvas }) {
  return (
    <React.Fragment>
      <Header onOpenOffcanvas={() => setShowOffcanvas(true)} />
      <Offcanvas show={showOffcanvas} onClose={() => setShowOffcanvas(false)} />
      <CheckoutBanner />
      <Checkout />

      <Footer />
    </React.Fragment>
  );
}
export default CheckoutPage;
