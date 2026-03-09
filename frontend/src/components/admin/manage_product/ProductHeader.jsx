import React from "react";
import { FaPlus } from "react-icons/fa";

const ProductHeader = ({ onAddClick }) => {
  return (
    <div className="product-header">
      <h1 className="product-title">Quản Lý Sản Phẩm</h1>
      <button className="btn-add" onClick={onAddClick}>
        <FaPlus /> Thêm Sản Phẩm
      </button>
    </div>
  );
};

export default ProductHeader;
