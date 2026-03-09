import React, { useState, useEffect } from "react";
import { FaSave, FaTimes, FaUpload } from "react-icons/fa";
import categoryService from "../../../services/categoryService";
import productService from "../../../services/productService";
import "./AddProduct.css";

const EditProduct = ({ productId, onSubmit, onCancel }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
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
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    fetchCategories();
    fetchProduct();
  }, [productId]);

  const fetchCategories = async () => {
    try {
      const data = await categoryService.getAllCategories();
      setCategories(data || []);
    } catch (error) {
      console.error("Lỗi khi lấy danh mục:", error);
    }
  };

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const data = await productService.getProductById(productId);
      setFormData({
        name: data.name || "",
        description: data.description || "",
        short_description: data.short_description || "",
        price: data.price || "",
        sale_price: data.sale_price || "",
        quantity: data.quantity || "",
        tags: data.tags || "",
        category_id: data.category_id || "",
      });

      if (data?.image) {
        const url =
          typeof data.image === "string" && data.image.startsWith("http")
            ? data.image
            : typeof data.image === "string" && data.image.startsWith("/")
              ? data.image
              : `/uploads/products/${data.image}`;
        setImagePreview(url);
      } else {
        setImagePreview(null);
      }
    } catch (error) {
      console.error("Lỗi khi lấy sản phẩm:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const productData = {
      ...formData,
      price: parseFloat(formData.price),
      sale_price: parseFloat(formData.sale_price) || 0,
      quantity: parseInt(formData.quantity) || 0,
      category_id: formData.category_id ? parseInt(formData.category_id) : null,
    };
    onSubmit(productData, imageFile);
  };

  if (loading) {
    return (
      <div className="add-product-container">
        <p style={{ textAlign: "center", padding: "2rem" }}>Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="add-product-container">
      <div className="add-product-header">
        <h2>Cập Nhật Sản Phẩm</h2>
        <button className="btn-close" onClick={onCancel}>
          <FaTimes />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="product-form">
        <div className="form-row">
          <div className="form-group">
            <label>Tên sản phẩm *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Nhập tên sản phẩm"
            />
          </div>

          <div className="form-group">
            <label>Danh mục</label>
            <select
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
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

        <div className="form-group">
          <label>Hình ảnh</label>
          <div className="image-upload">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              id="image-input-edit"
              style={{ display: "none" }}
            />
            <label htmlFor="image-input-edit" className="upload-btn">
              <FaUpload /> Chọn ảnh mới
            </label>
            {imagePreview && (
              <img src={imagePreview} alt="Preview" className="image-preview" />
            )}
          </div>
        </div>

        <div className="form-group">
          <label>Mô tả ngắn *</label>
          <input
            type="text"
            name="short_description"
            value={formData.short_description}
            onChange={handleChange}
            required
            placeholder="Mô tả ngắn gọn về sản phẩm"
          />
        </div>

        <div className="form-group">
          <label>Mô tả chi tiết *</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows="4"
            placeholder="Mô tả chi tiết về sản phẩm"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Giá *</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
              placeholder="0"
              min="0"
            />
          </div>

          <div className="form-group">
            <label>Giá sale</label>
            <input
              type="number"
              name="sale_price"
              value={formData.sale_price}
              onChange={handleChange}
              placeholder="0"
              min="0"
            />
          </div>

          <div className="form-group">
            <label>Số lượng *</label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              required
              placeholder="0"
              min="0"
            />
          </div>
        </div>

        <div className="form-group">
          <label>Tags</label>
          <input
            type="text"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            placeholder="tag1, tag2, tag3"
          />
        </div>

        <div className="form-actions">
          <button type="button" className="btn-cancel" onClick={onCancel}>
            <FaTimes /> Hủy
          </button>
          <button type="submit" className="btn-submit">
            <FaSave /> Cập nhật
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProduct;
