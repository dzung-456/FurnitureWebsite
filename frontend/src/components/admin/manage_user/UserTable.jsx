import React from "react";
import { FaEye, FaEdit, FaTrash, FaUser } from "react-icons/fa";

const UserTable = ({ users, onView, onEdit, onDelete }) => {
  const safeUsers = Array.isArray(users) ? users : [];

  const resolveAvatarSrc = (value) => {
    if (!value) return null;
    if (typeof value !== "string") return null;
    const v = value.trim();
    if (!v) return null;
    if (/^https?:\/\//i.test(v)) return v;
    return `/uploads/avatars/${v}`;
  };

  const tableStyle = {
    background: "white",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
    overflow: "hidden",
    marginBottom: "1.5rem",
  };

  const btnStyle = {
    width: "36px",
    height: "36px",
    border: "none",
    borderRadius: "6px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "all 0.3s ease",
    fontSize: "0.95rem",
  };

  return (
    <div style={tableStyle}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead style={{ background: "#2d3748" }}>
          <tr>
            <th
              style={{
                padding: "0.875rem",
                textAlign: "left",
                fontSize: "0.8125rem",
                fontWeight: 600,
                color: "white",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Avatar
            </th>
            <th
              style={{
                padding: "0.875rem",
                textAlign: "left",
                fontSize: "0.8125rem",
                fontWeight: 600,
                color: "white",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Tên đăng nhập
            </th>
            <th
              style={{
                padding: "0.875rem",
                textAlign: "left",
                fontSize: "0.8125rem",
                fontWeight: 600,
                color: "white",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Email
            </th>
            <th
              style={{
                padding: "0.875rem",
                textAlign: "left",
                fontSize: "0.8125rem",
                fontWeight: 600,
                color: "white",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Họ tên
            </th>
            <th
              style={{
                padding: "0.875rem",
                textAlign: "left",
                fontSize: "0.8125rem",
                fontWeight: 600,
                color: "white",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Vai trò
            </th>
            <th
              style={{
                padding: "0.875rem",
                textAlign: "left",
                fontSize: "0.8125rem",
                fontWeight: 600,
                color: "white",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Trạng thái
            </th>
            <th
              style={{
                padding: "0.875rem",
                textAlign: "left",
                fontSize: "0.8125rem",
                fontWeight: 600,
                color: "white",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Hành động
            </th>
          </tr>
        </thead>
        <tbody>
          {safeUsers.map((user) => (
            <tr
              key={user.id}
              style={{
                borderBottom: "1px solid #e2e8f0",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) =>
                (e.target.parentElement.style.background = "#f7fafc")
              }
              onMouseLeave={(e) =>
                (e.target.parentElement.style.background = "white")
              }
            >
              <td
                style={{
                  padding: "0.875rem",
                  fontSize: "0.875rem",
                  color: "#4a5568",
                }}
              >
                {user.avatar ? (
                  <img
                    src={resolveAvatarSrc(user.avatar)}
                    alt={user.username}
                    style={{
                      width: "40px",
                      height: "40px",
                      objectFit: "cover",
                      borderRadius: "50%",
                      border: "2px solid #e2e8f0",
                    }}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      // Show fallback icon if external image fails.
                      e.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      background: "#e2e8f0",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <FaUser style={{ color: "#a0aec0" }} />
                  </div>
                )}
              </td>
              <td
                style={{
                  padding: "0.875rem",
                  fontSize: "0.875rem",
                  color: "#2d3748",
                  fontWeight: 600,
                }}
              >
                {user.username}
              </td>
              <td
                style={{
                  padding: "0.875rem",
                  fontSize: "0.875rem",
                  color: "#4a5568",
                }}
              >
                {user.email}
              </td>
              <td
                style={{
                  padding: "0.875rem",
                  fontSize: "0.875rem",
                  color: "#4a5568",
                }}
              >
                {user.full_name || "Chưa cập nhật"}
              </td>
              <td
                style={{
                  padding: "0.875rem",
                  fontSize: "0.875rem",
                  color: "#4a5568",
                }}
              >
                <span
                  style={{
                    display: "inline-block",
                    padding: "0.375rem 0.75rem",
                    background: user.role === "admin" ? "#feebc8" : "#e2e8f0",
                    color: user.role === "admin" ? "#7c2d12" : "#4a5568",
                    borderRadius: "6px",
                    fontSize: "0.875rem",
                    fontWeight: 500,
                  }}
                >
                  {user.role === "admin" ? "Quản trị" : "Khách hàng"}
                </span>
              </td>
              <td
                style={{
                  padding: "0.875rem",
                  fontSize: "0.875rem",
                  color: "#4a5568",
                }}
              >
                <span
                  style={{
                    display: "inline-block",
                    padding: "0.375rem 0.75rem",
                    background:
                      user.status === "active" ? "#c6f6d5" : "#fed7d7",
                    color: user.status === "active" ? "#22543d" : "#742a2a",
                    borderRadius: "6px",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                  }}
                >
                  {user.status === "active" ? "Hoạt động" : "Bị cấm"}
                </span>
              </td>
              <td
                style={{
                  padding: "0.875rem",
                  fontSize: "0.875rem",
                  color: "#4a5568",
                }}
              >
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button
                    onClick={() => onView(user.id)}
                    style={{
                      ...btnStyle,
                      background: "#bee3f8",
                      color: "#2c5282",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = "#90cdf4";
                      e.target.style.transform = "translateY(-2px)";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = "#bee3f8";
                      e.target.style.transform = "translateY(0)";
                    }}
                  >
                    <FaEye />
                  </button>
                  <button
                    onClick={() => onEdit(user.id)}
                    style={{
                      ...btnStyle,
                      background: "#feebc8",
                      color: "#7c2d12",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = "#fbd38d";
                      e.target.style.transform = "translateY(-2px)";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = "#feebc8";
                      e.target.style.transform = "translateY(0)";
                    }}
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => onDelete(user.id)}
                    style={{
                      ...btnStyle,
                      background: "#fed7d7",
                      color: "#742a2a",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = "#fc8181";
                      e.target.style.transform = "translateY(-2px)";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = "#fed7d7";
                      e.target.style.transform = "translateY(0)";
                    }}
                  >
                    <FaTrash />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {safeUsers.length === 0 && (
        <div style={{ textAlign: "center", padding: "3rem", color: "#6b7280" }}>
          <p style={{ fontSize: "1.125rem", margin: 0 }}>
            Không có người dùng nào
          </p>
        </div>
      )}
    </div>
  );
};

export default UserTable;
