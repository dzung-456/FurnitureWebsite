import React, { useState, useEffect } from "react";
import { FaTimes, FaEdit, FaTrash, FaUser } from "react-icons/fa";
import userService from "../../../services/userService";

const ViewUser = ({ userId, onClose, onEdit, onDelete }) => {
  const [user, setUser] = useState(null);
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
      const data = await userService.getUserById(userId);
      setUser(data);
    } catch (error) {
      console.error("Lỗi khi lấy chi tiết người dùng:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    onEdit(userId);
  };

  const handleDelete = () => {
    if (window.confirm("Bạn có chắc muốn xóa người dùng này?")) {
      onDelete(userId);
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

  const badgeStyle = {
    display: "inline-block",
    padding: "0.375rem 0.75rem",
    borderRadius: "6px",
    fontSize: "0.875rem",
    fontWeight: 600,
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

  if (!user) {
    return (
      <div style={containerStyle}>
        <div style={{ textAlign: "center", padding: "3rem" }}>
          <p style={{ fontSize: "1.2rem", color: "#e53e3e" }}>
            Không tìm thấy người dùng
          </p>
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
          Chi Tiết Người Dùng
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
            justifyContent: "center",
          }}
        >
          <FaTimes />
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "200px 1fr",
          gap: "2rem",
          marginBottom: "2rem",
        }}
      >
        <div style={{ display: "flex", justifyContent: "center" }}>
          {user.avatar ? (
            <img
              src={resolveAvatarSrc(user.avatar)}
              alt={user.username}
              style={{
                width: "150px",
                height: "150px",
                objectFit: "cover",
                borderRadius: "50%",
                border: "4px solid #e2e8f0",
              }}
              referrerPolicy="no-referrer"
            />
          ) : (
            <div
              style={{
                width: "150px",
                height: "150px",
                background: "#f7fafc",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "4px solid #e2e8f0",
              }}
            >
              <FaUser style={{ fontSize: "4rem", color: "#a0aec0" }} />
            </div>
          )}
        </div>

        <div
          style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
        >
          <div style={fieldStyle}>
            <label style={labelStyle}>Tên đăng nhập</label>
            <span
              style={{ ...valueStyle, fontSize: "1.25rem", fontWeight: 700 }}
            >
              {user.username}
            </span>
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>Email</label>
            <span style={valueStyle}>{user.email}</span>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1rem",
            }}
          >
            <div style={fieldStyle}>
              <label style={labelStyle}>Họ tên</label>
              <span style={valueStyle}>
                {user.full_name || "Chưa cập nhật"}
              </span>
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Số điện thoại</label>
              <span style={valueStyle}>{user.phone || "Chưa cập nhật"}</span>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1rem",
            }}
          >
            <div style={fieldStyle}>
              <label style={labelStyle}>Vai trò</label>
              <span
                style={{
                  ...badgeStyle,
                  background: user.role === "admin" ? "#feebc8" : "#e2e8f0",
                  color: user.role === "admin" ? "#7c2d12" : "#4a5568",
                }}
              >
                {user.role === "admin" ? "Quản trị viên" : "Khách hàng"}
              </span>
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Trạng thái</label>
              <span
                style={{
                  ...badgeStyle,
                  background: user.status === "active" ? "#c6f6d5" : "#fed7d7",
                  color: user.status === "active" ? "#22543d" : "#742a2a",
                }}
              >
                {user.status === "active" ? "Hoạt động" : "Bị cấm"}
              </span>
            </div>
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>Ngày tạo</label>
            <span style={valueStyle}>
              {new Date(user.created_at).toLocaleDateString("vi-VN")}
            </span>
          </div>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: "1rem",
          paddingTop: "1.5rem",
          borderTop: "2px solid #e2e8f0",
        }}
      >
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

export default ViewUser;
