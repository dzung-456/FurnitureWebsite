import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
// import "./assets/css/bootstrap.min.css";
// import "./assets/css/meanmenu.min.css";
// import "./assets/css/animate.css";
// import "./assets/css/swiper.min.css";
// import "./assets/css/slick.css";
// import "./assets/css/magnific-popup.css";
// import "./assets/css/fontawesome-pro.css";
// import "./assets/css/spacing.css";
// import "./assets/css/main.css";

createRoot(document.body).render(
  <StrictMode>
    <App />
  </StrictMode>
);
