import React, { useState, useEffect } from "react";
import { FaSave, FaTimes, FaUpload } from "react-icons/fa";
import userService from "../../../services/userService";

const EditUser = ({ userId, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    full_name: "",
    phone: "",
    role: "customer",
    status: "active",
  });
  const [errors, setErrors] = useState({});
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [loading, setLoading] = useState(true);

  const resolveAvatarSrc = (value) => {
    if (!value) return null;
    if (typeof value !== "string") return null;
    const v = value.trim();
    if (!v) return null;
    if (/^https?:\/\//i.test(v)) return v;
    return `/uploads/avatars/${v}`;
  };

  useEffect(() => {
    fetchUser();
  }, [userId]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const user = await userService.getUserById(userId);
      setFormData({
        username: user.username || "",
        email: user.email || "",
        full_name: user.full_name || "",
        phone: user.phone || "",
        role: user.role || "customer",
        status: user.status || "active",
      });
      if (user.avatar) {
        setAvatarPreview(resolveAvatarSrc(user.avatar));
      }
    } catch (error) {
      console.error("Lỗi khi lấy thông tin người dùng:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (formData.username.length < 3) {
      newErrors.username = "Username phải có ít nhất 3 ký tự";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      newErrors.email = "Email không hợp lệ";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await onSubmit(formData, avatarFile);
    } catch (error) {
      console.error("Lỗi chi tiết:", error);
      if (error.response?.data?.detail) {
        const detail = error.response.data.detail;
        if (typeof detail === "string") {
          setErrors({ general: detail });
        }
      } else {
        setErrors({ general: "Lỗi không xác định khi cập nhật người dùng" });
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

  const inputStyle = {
    padding: "0.625rem 0.875rem",
    border: "2px solid #e2e8f0",
    borderRadius: "8px",
    fontSize: "0.9375rem",
    background: "white",
    width: "100%",
  };

  const errorInputStyle = {
    ...inputStyle,
    borderColor: "#fc8181",
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

  return (
    <div style={containerStyle}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
          paddingBottom: "1rem",
          borderBottom: "2px solid #e2e8f0",
        }}
      >
        <h2
          style={{
            fontSize: "1.5rem",
            fontWeight: 700,
            color: "#2d3748",
            margin: 0,
          }}
        >
          Chỉnh Sửa Người Dùng
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
            justifyContent: "center",
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

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "1.5rem",
          }}
        >
          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
          >
            <label
              style={{
                fontSize: "0.9375rem",
                fontWeight: 600,
                color: "#2d3748",
              }}
            >
              Tên đăng nhập *
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              placeholder="Nhập tên đăng nhập"
              style={errors.username ? errorInputStyle : inputStyle}
            />
            {errors.username && (
              <span
                style={{
                  fontSize: "0.875rem",
                  color: "#c53030",
                  marginTop: "0.25rem",
                }}
              >
                {errors.username}
              </span>
            )}
          </div>

          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
          >
            <label
              style={{
                fontSize: "0.9375rem",
                fontWeight: 600,
                color: "#2d3748",
              }}
            >
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Nhập email"
              style={errors.email ? errorInputStyle : inputStyle}
            />
            {errors.email && (
              <span
                style={{
                  fontSize: "0.875rem",
                  color: "#c53030",
                  marginTop: "0.25rem",
                }}
              >
                {errors.email}
              </span>
            )}
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "1.5rem",
          }}
        >
          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
          >
            <label
              style={{
                fontSize: "0.9375rem",
                fontWeight: 600,
                color: "#2d3748",
              }}
            >
              Họ tên
            </label>
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              placeholder="Nhập họ tên"
              style={inputStyle}
            />
          </div>

          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
          >
            <label
              style={{
                fontSize: "0.9375rem",
                fontWeight: 600,
                color: "#2d3748",
              }}
            >
              Số điện thoại
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Nhập số điện thoại"
              style={inputStyle}
            />
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "1.5rem",
          }}
        >
          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
          >
            <label
              style={{
                fontSize: "0.9375rem",
                fontWeight: 600,
                color: "#2d3748",
              }}
            >
              Vai trò
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              style={inputStyle}
            >
              <option value="customer">Khách hàng</option>
              <option value="admin">Quản trị viên</option>
            </select>
          </div>

          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
          >
            <label
              style={{
                fontSize: "0.9375rem",
                fontWeight: 600,
                color: "#2d3748",
              }}
            >
              Trạng thái
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              style={inputStyle}
            >
              <option value="active">Hoạt động</option>
              <option value="banned">Bị cấm</option>
            </select>
          </div>
        </div>

        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
        >
          <label
            style={{ fontSize: "0.9375rem", fontWeight: 600, color: "#2d3748" }}
          >
            Avatar
          </label>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              id="avatar-input"
              style={{ display: "none" }}
            />
            <label
              htmlFor="avatar-input"
              style={{
                ...btnStyle,
                background: "#e2e8f0",
                color: "#4a5568",
                padding: "0.625rem 1.25rem",
              }}
            >
              <FaUpload /> Chọn ảnh mới
            </label>
            {avatarPreview && (
              <img
                src={avatarPreview}
                alt="Preview"
                style={{
                  width: "60px",
                  height: "60px",
                  objectFit: "cover",
                  borderRadius: "50%",
                  border: "2px solid #e2e8f0",
                }}
              />
            )}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "1rem",
            marginTop: "1rem",
            paddingTop: "1.5rem",
            borderTop: "2px solid #e2e8f0",
          }}
        >
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
            <FaSave /> Cập nhật
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditUser;
