import React, { useState, useEffect } from "react";
import { FaTimes, FaEdit, FaTrash } from "react-icons/fa";
import productService from "../../../services/productService";

const ViewProduct = ({ productId, onClose, onEdit, onDelete }) => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const data = await productService.getProductById(productId);
      setProduct(data);
    } catch (error) {
      console.error("Lỗi khi lấy chi tiết sản phẩm:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    onEdit(productId);
  };

  const handleDelete = () => {
    if (window.confirm("Bạn có chắc muốn xóa sản phẩm này?")) {
      onDelete(productId);
    }
  };

  const containerStyle = {
    background: "white",
    borderRadius: "12px",
    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1)",
    padding: "2rem",
    maxWidth: "900px",
    margin: "2rem auto",
  };

  const headerStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "2rem",
    paddingBottom: "1rem",
    borderBottom: "2px solid #e2e8f0",
  };

  const contentStyle = {
    display: "grid",
    gridTemplateColumns: "300px 1fr",
    gap: "2rem",
    marginBottom: "2rem",
  };

  const imageStyle = {
    width: "100%",
    height: "300px",
    objectFit: "cover",
    borderRadius: "8px",
    border: "2px solid #e2e8f0",
  };

  const infoStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  };

  const fieldStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  };

  const labelStyle = {
    fontSize: "0.875rem",
    fontWeight: 600,
    color: "#4a5568",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  };

  const valueStyle = {
    fontSize: "1rem",
    color: "#2d3748",
    fontWeight: 500,
  };

  const priceStyle = {
    fontSize: "1.5rem",
    fontWeight: 700,
    color: "#667eea",
  };

  const salePriceStyle = {
    fontSize: "1.25rem",
    fontWeight: 600,
    color: "#e53e3e",
  };

  const badgeStyle = {
    display: "inline-block",
    padding: "0.375rem 0.75rem",
    borderRadius: "6px",
    fontSize: "0.875rem",
    fontWeight: 600,
  };

  const actionStyle = {
    display: "flex",
    justifyContent: "flex-end",
    gap: "1rem",
    paddingTop: "1.5rem",
    borderTop: "2px solid #e2e8f0",
  };

  const btnStyle = {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0.625rem 1.25rem",
    border: "none",
    borderRadius: "8px",
    fontSize: "0.9375rem",
    fontWeight: 600,
    cursor: "pointer",
  };

  if (loading) {
    return (
      <div style={containerStyle}>
        <div style={{ textAlign: "center", padding: "3rem" }}>
          <p style={{ fontSize: "1.2rem", color: "#667eea" }}>Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div style={containerStyle}>
        <div style={{ textAlign: "center", padding: "3rem" }}>
          <p style={{ fontSize: "1.2rem", color: "#e53e3e" }}>
            Không tìm thấy sản phẩm
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#2d3748", margin: 0 }}>
          Chi Tiết Sản Phẩm
        </h2>
        <button
          onClick={onClose}
          style={{
            ...btnStyle,
            width: "40px",
            height: "40px",
            padding: 0,
            background: "#fed7d7",
            color: "#742a2a",
            fontSize: "1.2rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <FaTimes />
        </button>
      </div>

      <div style={contentStyle}>
        <div>
          {product.image ? (
            <img
              src={`/uploads/products/${product.image}`}
              alt={product.name}
              style={imageStyle}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <div
            style={{
              ...imageStyle,
              display: product.image ? "none" : "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#f7fafc",
              color: "#a0aec0",
            }}
          >
            Không có hình ảnh
          </div>
        </div>

        <div style={infoStyle}>
          <div style={fieldStyle}>
            <label style={labelStyle}>Tên sản phẩm</label>
            <span style={{ ...valueStyle, fontSize: "1.25rem", fontWeight: 700 }}>
              {product.name}
            </span>
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>Mô tả ngắn</label>
            <span style={valueStyle}>{product.short_description}</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div style={fieldStyle}>
              <label style={labelStyle}>Giá gốc</label>
              <span style={priceStyle}>
                {product.price?.toLocaleString("vi-VN")} VNĐ
              </span>
            </div>
            {product.sale_price > 0 && (
              <div style={fieldStyle}>
                <label style={labelStyle}>Giá sale</label>
                <span style={salePriceStyle}>
                  {product.sale_price?.toLocaleString("vi-VN")} VNĐ
                </span>
              </div>
            )}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div style={fieldStyle}>
              <label style={labelStyle}>Số lượng</label>
              <span style={valueStyle}>{product.quantity}</span>
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Đánh giá</label>
              <span style={valueStyle}>{product.average_rating}/5 ⭐</span>
            </div>
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>Danh mục</label>
            <span style={{ ...badgeStyle, background: "#edf2f7", color: "#4a5568" }}>
              {product.category?.name || "Chưa phân loại"}
            </span>
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>Trạng thái</label>
            <span
              style={{
                ...badgeStyle,
                background: product.quantity > 0 ? "#c6f6d5" : "#fed7d7",
                color: product.quantity > 0 ? "#22543d" : "#742a2a",
              }}
            >
              {product.quantity > 0 ? "Còn hàng" : "Hết hàng"}
            </span>
          </div>

          {product.tags && (
            <div style={fieldStyle}>
              <label style={labelStyle}>Tags</label>
              <span style={valueStyle}>{product.tags}</span>
            </div>
          )}
        </div>
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>Mô tả chi tiết</label>
        <div
          style={{
            ...valueStyle,
            background: "#f7fafc",
            padding: "1rem",
            borderRadius: "8px",
            lineHeight: "1.6",
          }}
        >
          {product.description}
        </div>
      </div>

      <div style={actionStyle}>
        <button
          onClick={onClose}
          style={{ ...btnStyle, background: "#e2e8f0", color: "#4a5568" }}
        >
          <FaTimes /> Đóng
        </button>
        <button
          onClick={handleEdit}
          style={{ ...btnStyle, background: "#feebc8", color: "#7c2d12" }}
        >
          <FaEdit /> Sửa
        </button>
        <button
          onClick={handleDelete}
          style={{ ...btnStyle, background: "#fed7d7", color: "#742a2a" }}
        >
          <FaTrash /> Xóa
        </button>
      </div>
    </div>
  );
};

export default ViewProduct;