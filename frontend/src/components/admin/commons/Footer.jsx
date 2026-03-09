import React from "react";
import { FaHeart, FaGithub, FaTwitter, FaEnvelope } from "react-icons/fa";
import "./footer.css";

const Footer = () => {
  return (
    <footer className="admin-footer">
      {/* Left Section */}
      <div className="footer-left">
        <p className="footer-copyright">
          © 2025 FurniDev. Made with{" "}
          <FaHeart className="footer-heart" /> by Team FurniDev
        </p>
        <div className="footer-links">
          <a href="#" className="footer-link">
            Privacy Policy
          </a>
          <a href="#" className="footer-link">
            Terms of Service
          </a>
          <a href="#" className="footer-link">
            Support
          </a>
        </div>
      </div>

      {/* Right Section */}
      <div className="footer-right">
        <div className="footer-social">
          <a href="#" className="footer-social-link">
            <FaGithub />
          </a>
          <a href="#" className="footer-social-link">
            <FaTwitter />
          </a>
          <a href="#" className="footer-social-link">
            <FaEnvelope />
          </a>
        </div>
        <div className="footer-divider"></div>
        <span className="footer-version">v1.0.0</span>
      </div>
    </footer>
  );
};

export default Footer;
