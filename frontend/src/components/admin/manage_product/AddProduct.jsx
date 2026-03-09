import React, { useState, useEffect } from "react";
import { FaSave, FaTimes, FaUpload } from "react-icons/fa";
import categoryService from "../../../services/categoryService";
import "./AddProduct.css";

const AddProduct = ({ onSubmit, onCancel }) => {
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    short_description: "",
    price: "",
    sale_price: "",
    quantity: "",
    tags: "",
    category_id: "",
  });
  const [errors, setErrors] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await categoryService.getAllCategories();
      setCategories(data || []);
    } catch (error) {
      console.error("Lỗi khi lấy danh mục:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const price = parseFloat(formData.price);
    const salePrice = parseFloat(formData.sale_price) || 0;

    if (salePrice > 0 && salePrice >= price) {
      newErrors.sale_price = "Giá sale phải nhỏ hơn giá gốc";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const productData = {
      ...formData,
      price: parseFloat(formData.price),
      sale_price: parseFloat(formData.sale_price) || 0,
      quantity: parseInt(formData.quantity) || 0,
      category_id: formData.category_id ? parseInt(formData.category_id) : null,
    };

    try {
      await onSubmit(productData, imageFile);
    } catch (error) {
      console.error("Lỗi chi tiết:", error);
      if (error.response?.data?.detail) {
        const detail = error.response.data.detail;
        if (typeof detail === "string") {
          setErrors({ general: detail });
        } else if (Array.isArray(detail)) {
          const fieldErrors = {};
          detail.forEach((err) => {
            if (err.loc && err.loc.length > 1) {
              fieldErrors[err.loc[1]] = err.msg;
            }
          });
          setErrors(fieldErrors);
        }
      } else {
        setErrors({ general: "Lỗi không xác định khi thêm sản phẩm" });
      }
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

  const formStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
  };

  const formRowStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "1.5rem",
  };

  const formGroupStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  };

  const inputStyle = {
    padding: "0.625rem 0.875rem",
    border: "2px solid #e2e8f0",
    borderRadius: "8px",
    fontSize: "0.9375rem",
    background: "white",
  };

  const errorInputStyle = {
    ...inputStyle,
    borderColor: "#fc8181",
  };

  const errorTextStyle = {
    fontSize: "0.875rem",
    color: "#c53030",
    marginTop: "0.25rem",
  };

  const formActionsStyle = {
    display: "flex",
    justifyContent: "flex-end",
    gap: "1rem",
    marginTop: "1rem",
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

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h2
          style={{
            fontSize: "1.5rem",
            fontWeight: 700,
            color: "#2d3748",
            margin: 0,
          }}
        >
          Thêm Sản Phẩm Mới
        </h2>
        <button
          onClick={onCancel}
          style={{
            ...btnStyle,
            width: "40px",
            height: "40px",
            padding: 0,
            background: "#fed7d7",
            color: "#742a2a",
            fontSize: "1.2rem",
          }}
        >
          <FaTimes />
        </button>
      </div>

      {errors.general && (
        <div
          style={{
            background: "#fed7d7",
            color: "#742a2a",
            padding: "1rem",
            borderRadius: "8px",
            marginBottom: "1rem",
          }}
        >
          {errors.general}
        </div>
      )}

      <form onSubmit={handleSubmit} style={formStyle}>
        <div style={formRowStyle}>
          <div style={formGroupStyle}>
            <label
              style={{
                fontSize: "0.9375rem",
                fontWeight: 600,
                color: "#2d3748",
              }}
            >
              Tên sản phẩm *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Nhập tên sản phẩm"
              style={inputStyle}
            />
          </div>

          <div style={formGroupStyle}>
            <label
              style={{
                fontSize: "0.9375rem",
                fontWeight: 600,
                color: "#2d3748",
              }}
            >
              Danh mục
            </label>
            <select
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              style={inputStyle}
            >
              <option value="">Chọn danh mục</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={formGroupStyle}>
          <label
            style={{ fontSize: "0.9375rem", fontWeight: 600, color: "#2d3748" }}
          >
            Hình ảnh
          </label>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              id="image-input"
              style={{ display: "none" }}
            />
            <label
              htmlFor="image-input"
              style={{
                ...btnStyle,
                background: "#e2e8f0",
                color: "#4a5568",
                padding: "0.625rem 1.25rem",
              }}
            >
              <FaUpload /> Chọn ảnh
            </label>
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Preview"
                style={{
                  width: "100px",
                  height: "100px",
                  objectFit: "cover",
                  borderRadius: "8px",
                  border: "2px solid #e2e8f0",
                }}
              />
            )}
          </div>
        </div>

        <div style={formGroupStyle}>
          <label
            style={{ fontSize: "0.9375rem", fontWeight: 600, color: "#2d3748" }}
          >
            Mô tả ngắn *
          </label>
          <input
            type="text"
            name="short_description"
            value={formData.short_description}
            onChange={handleChange}
            required
            placeholder="Mô tả ngắn gọn về sản phẩm"
            style={inputStyle}
          />
        </div>

        <div style={formGroupStyle}>
          <label
            style={{ fontSize: "0.9375rem", fontWeight: 600, color: "#2d3748" }}
          >
            Mô tả chi tiết *
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows="4"
            placeholder="Mô tả chi tiết về sản phẩm"
            style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }}
          />
        </div>

        <div style={formRowStyle}>
          <div style={formGroupStyle}>
            <label
              style={{
                fontSize: "0.9375rem",
                fontWeight: 600,
                color: "#2d3748",
              }}
            >
              Giá *
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
              placeholder="0"
              min="0"
              style={inputStyle}
            />
          </div>

          <div style={formGroupStyle}>
            <label
              style={{
                fontSize: "0.9375rem",
                fontWeight: 600,
                color: "#2d3748",
              }}
            >
              Giá sale
            </label>
            <input
              type="number"
              name="sale_price"
              value={formData.sale_price}
              onChange={handleChange}
              placeholder="0"
              min="0"
              style={errors.sale_price ? errorInputStyle : inputStyle}
            />
            {errors.sale_price && (
              <span style={errorTextStyle}>{errors.sale_price}</span>
            )}
          </div>

          <div style={formGroupStyle}>
            <label
              style={{
                fontSize: "0.9375rem",
                fontWeight: 600,
                color: "#2d3748",
              }}
            >
              Số lượng *
            </label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              required
              placeholder="0"
              min="0"
              style={inputStyle}
            />
          </div>
        </div>

        <div style={formGroupStyle}>
          <label
            style={{
              fontSize: "0.9375rem",
              fontWeight: 600,
              color: "#2d3748",
            }}
          >
            Tags
          </label>
          <input
            type="text"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            placeholder="tag1, tag2, tag3"
            style={inputStyle}
          />
        </div>

        <div style={formActionsStyle}>
          <button
            type="button"
            onClick={onCancel}
            style={{ ...btnStyle, background: "#e2e8f0", color: "#4a5568" }}
          >
            <FaTimes /> Hủy
          </button>
          <button
            type="submit"
            style={{
              ...btnStyle,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
            }}
          >
            <FaSave /> Lưu sản phẩm
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;
