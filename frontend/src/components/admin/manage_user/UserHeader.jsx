import React from "react";
import { FaPlus } from "react-icons/fa";

const UserHeader = ({ onAddClick }) => {
  const btnStyle = {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0.75rem 1.5rem",
    background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "0.875rem",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 12px rgba(79, 70, 229, 0.3)",
  };

  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
      <h1 style={{ fontSize: "1.75rem", fontWeight: 700, color: "#2d3748", margin: 0 }}>
        Quản Lý Người Dùng
      </h1>
      <button 
        style={btnStyle}
        onClick={onAddClick}
        onMouseEnter={(e) => {
          e.target.style.transform = "translateY(-2px)";
          e.target.style.boxShadow = "0 6px 16px rgba(79, 70, 229, 0.4)";
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = "translateY(0)";
          e.target.style.boxShadow = "0 4px 12px rgba(79, 70, 229, 0.3)";
        }}
      >
        <FaPlus /> Thêm Người Dùng
      </button>
    </div>
  );
};

export default UserHeader;