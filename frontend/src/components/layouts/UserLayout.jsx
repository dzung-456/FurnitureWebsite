import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";

const UserLayout = () => {
  useEffect(() => {
    const cssFiles = [
      "../../assets/css/bootstrap.min.css",
      "../../assets/css/meanmenu.min.css",
      "../../assets/css/animate.css",
      "../../assets/css/swiper.min.css",
      "../../assets/css/slick.css",
      "../../assets/css/magnific-popup.css",
      "../../assets/css/fontawesome-pro.css",
      "../../assets/css/spacing.css",
      "../../assets/css/main.css",
    ];

    const links = [];
    cssFiles.forEach((file) => {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = new URL(file, import.meta.url).href;
      link.dataset.userLayout = "true";
      document.head.appendChild(link);
      links.push(link);
    });

    return () => {
      links.forEach((link) => link.remove());
    };
  }, []);

  return <Outlet />;
};

export default UserLayout;
