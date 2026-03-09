import React from "react";
import { FaSearch } from "react-icons/fa";

const ProductControls = ({
  searchTerm,
  onSearchChange,
  categories = [],
  categoryFilter,
  onCategoryChange,
  statusFilter,
  onStatusChange,
}) => {
  return (
    <div className="product-controls">
      <div className="search-box">
        <FaSearch className="search-icon" />
        <input
          type="text"
          placeholder="Tìm kiếm sản phẩm..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <div className="filter-group">
        <select
          className="filter-select"
          value={categoryFilter}
          onChange={(e) => onCategoryChange(e.target.value)}
        >
          <option value="">Tất cả danh mục</option>
          {(categories || []).map((c) => (
            <option key={c.id} value={String(c.id)}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          className="filter-select"
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
        >
          <option value="">Tất cả trạng thái</option>
          <option value="in_stock">Còn hàng</option>
          <option value="out_of_stock">Hết hàng</option>
        </select>
      </div>
    </div>
  );
};

export default ProductControls;
