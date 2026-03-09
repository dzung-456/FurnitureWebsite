import React, { useState } from "react";
import Header from "../commons/Header.jsx";
import Footer from "../commons/Footer.jsx";
import Offcanvas from "../commons/OffCanvas.jsx";
import ContactBanner from "../banners/contactBanner.jsx";
import Contact from "../contact/contact.jsx";
export function ContactPage({ showOffcanvas, setShowOffcanvas }) {
  return (
    <React.Fragment>
      <Header onOpenOffcanvas={() => setShowOffcanvas(true)} />
      <Offcanvas show={showOffcanvas} onClose={() => setShowOffcanvas(false)} />
      <ContactBanner />
      <Contact />

      <Footer />
    </React.Fragment>
  );
}
export default ContactPage;
