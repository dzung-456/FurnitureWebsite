import React from "react";
import { FaSearch } from "react-icons/fa";

const OrderControls = ({
  searchTerm,
  onSearchChange,
  onStatusChange,
  onPaymentStatusChange,
}) => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "1.5rem",
        marginTop: "1.5rem",
        gap: "1rem",
        flexWrap: "wrap",
      }}
    >
      <div style={{ position: "relative", flex: 1, minWidth: "300px" }}>
        <FaSearch
          style={{
            position: "absolute",
            left: "1rem",
            top: "50%",
            transform: "translateY(-50%)",
            color: "#a0aec0",
            fontSize: "1rem",
          }}
        />
        <input
          type="text"
          placeholder="Tìm theo ID, tên khách hàng, email..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          style={{
            width: "100%",
            padding: "0.625rem 1rem 0.625rem 2.5rem",
            border: "2px solid #e2e8f0",
            borderRadius: "8px",
            fontSize: "0.875rem",
            transition: "all 0.3s ease",
          }}
          onFocus={(e) => {
            e.target.style.borderColor = "#667eea";
            e.target.style.boxShadow = "0 0 0 3px rgba(102, 126, 234, 0.1)";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = "#e2e8f0";
            e.target.style.boxShadow = "none";
          }}
        />
      </div>

      <div style={{ display: "flex", gap: "0.75rem" }}>
        <select
          onChange={(e) => onStatusChange(e.target.value)}
          style={{
            padding: "0.625rem 1rem",
            border: "2px solid #e2e8f0",
            borderRadius: "8px",
            fontSize: "0.875rem",
            background: "white",
            cursor: "pointer",
            transition: "all 0.3s ease",
          }}
        >
          <option value="">Tất cả trạng thái</option>
          <option value="pending">Chờ xử lý</option>
          <option value="processing">Đang xử lý</option>
          <option value="shipped">Đã gửi hàng</option>
          <option value="delivered">Đã giao hàng</option>
          <option value="cancelled">Đã hủy</option>
        </select>

        <select
          onChange={(e) => onPaymentStatusChange(e.target.value)}
          style={{
            padding: "0.625rem 1rem",
            border: "2px solid #e2e8f0",
            borderRadius: "8px",
            fontSize: "0.875rem",
            background: "white",
            cursor: "pointer",
            transition: "all 0.3s ease",
          }}
        >
          <option value="">Tất cả thanh toán</option>
          <option value="unpaid">Chưa thanh toán</option>
          <option value="paid">Đã thanh toán</option>
          <option value="failed">Thanh toán thất bại</option>
        </select>
      </div>
    </div>
  );
};

export default OrderControls;
