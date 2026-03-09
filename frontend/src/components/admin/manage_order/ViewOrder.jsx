import React, { useState, useEffect } from "react";
import {
  FaTimes,
  FaUser,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaCreditCard,
} from "react-icons/fa";
import orderService from "../../../services/orderService";

const ViewOrder = ({ orderId, onClose }) => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const data = await orderService.getOrderById(orderId);
      setOrder(data);
    } catch (error) {
      console.error("Lỗi khi lấy đơn hàng:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "#fbbf24",
      processing: "#3b82f6",
      shipped: "#8b5cf6",
      delivered: "#10b981",
      cancelled: "#ef4444",
    };
    return colors[status] || "#6b7280";
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "3rem" }}>
        <p style={{ fontSize: "1.2rem", color: "#667eea" }}>Đang tải...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div style={{ textAlign: "center", padding: "3rem" }}>
        <p style={{ fontSize: "1.2rem", color: "#ef4444" }}>
          Không tìm thấy đơn hàng
        </p>
      </div>
    );
  }

  const containerStyle = {
    background: "white",
    borderRadius: "12px",
    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1)",
    padding: "2rem",
    maxWidth: "900px",
    margin: "2rem auto",
  };

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
          Chi Tiết Đơn Hàng #{order.id}
        </h2>
        <button
          onClick={onClose}
          style={{
            width: "40px",
            height: "40px",
            padding: 0,
            background: "#fed7d7",
            color: "#742a2a",
            fontSize: "1.2rem",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          <FaTimes />
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "2rem",
          marginBottom: "2rem",
        }}
      >
        <div>
          <h3
            style={{
              fontSize: "1.125rem",
              fontWeight: 600,
              color: "#2d3748",
              marginBottom: "1rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <FaUser /> Thông tin khách hàng
          </h3>
          <div
            style={{
              background: "#f8fafc",
              padding: "1rem",
              borderRadius: "8px",
            }}
          >
            <p style={{ margin: "0.5rem 0", fontSize: "0.9375rem" }}>
              <strong>Tên:</strong> {order.shipping_fullname}
            </p>
            <p style={{ margin: "0.5rem 0", fontSize: "0.9375rem" }}>
              <strong>Email:</strong> {order.shipping_email}
            </p>
            <p style={{ margin: "0.5rem 0", fontSize: "0.9375rem" }}>
              <strong>Điện thoại:</strong> {order.shipping_phone}
            </p>
            <p style={{ margin: "0.5rem 0", fontSize: "0.9375rem" }}>
              <strong>Địa chỉ:</strong> {order.shipping_address}
            </p>
            {order.shipping_city && (
              <p style={{ margin: "0.5rem 0", fontSize: "0.9375rem" }}>
                <strong>Thành phố:</strong> {order.shipping_city}
              </p>
            )}
          </div>
        </div>

        <div>
          <h3
            style={{
              fontSize: "1.125rem",
              fontWeight: 600,
              color: "#2d3748",
              marginBottom: "1rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <FaCreditCard /> Thông tin đơn hàng
          </h3>
          <div
            style={{
              background: "#f8fafc",
              padding: "1rem",
              borderRadius: "8px",
            }}
          >
            <p style={{ margin: "0.5rem 0", fontSize: "0.9375rem" }}>
              <strong>Ngày đặt:</strong> {formatDate(order.order_date)}
            </p>
            <p style={{ margin: "0.5rem 0", fontSize: "0.9375rem" }}>
              <strong>Trạng thái:</strong>
              <span
                style={{
                  marginLeft: "0.5rem",
                  padding: "0.25rem 0.5rem",
                  borderRadius: "6px",
                  fontSize: "0.8125rem",
                  fontWeight: 500,
                  color: "white",
                  background: getStatusColor(order.status),
                }}
              >
                {order.status === "pending"
                  ? "Chờ xử lý"
                  : order.status === "processing"
                  ? "Đang xử lý"
                  : order.status === "shipped"
                  ? "Đã gửi hàng"
                  : order.status === "delivered"
                  ? "Đã giao hàng"
                  : "Đã hủy"}
              </span>
            </p>
            <p style={{ margin: "0.5rem 0", fontSize: "0.9375rem" }}>
              <strong>Phương thức thanh toán:</strong>{" "}
              {order.payment_method === "cod"
                ? "Thanh toán khi nhận hàng"
                : order.payment_method}
            </p>
            <p style={{ margin: "0.5rem 0", fontSize: "0.9375rem" }}>
              <strong>Trạng thái thanh toán:</strong>{" "}
              {order.payment_status === "paid"
                ? "Đã thanh toán"
                : order.payment_status === "unpaid"
                ? "Chưa thanh toán"
                : "Thất bại"}
            </p>
            {order.note && (
              <p style={{ margin: "0.5rem 0", fontSize: "0.9375rem" }}>
                <strong>Ghi chú:</strong> {order.note}
              </p>
            )}
          </div>
        </div>
      </div>

      <div style={{ marginBottom: "2rem" }}>
        <h3
          style={{
            fontSize: "1.125rem",
            fontWeight: 600,
            color: "#2d3748",
            marginBottom: "1rem",
          }}
        >
          Sản phẩm đã đặt
        </h3>
        <div
          style={{
            background: "#f8fafc",
            borderRadius: "8px",
            overflow: "hidden",
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#e2e8f0" }}>
                <th
                  style={{
                    padding: "0.75rem",
                    textAlign: "left",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                  }}
                >
                  Sản phẩm
                </th>
                <th
                  style={{
                    padding: "0.75rem",
                    textAlign: "center",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                  }}
                >
                  Số lượng
                </th>
                <th
                  style={{
                    padding: "0.75rem",
                    textAlign: "right",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                  }}
                >
                  Đơn giá
                </th>
                <th
                  style={{
                    padding: "0.75rem",
                    textAlign: "right",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                  }}
                >
                  Thành tiền
                </th>
              </tr>
            </thead>
            <tbody>
              {order.items?.map((item, index) => (
                <tr
                  key={item.id}
                  style={{
                    borderBottom:
                      index < order.items.length - 1
                        ? "1px solid #e2e8f0"
                        : "none",
                  }}
                >
                  <td style={{ padding: "0.75rem", fontSize: "0.875rem" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                      }}
                    >
                      {item.product?.image && (
                        <img
                          src={`/uploads/products/${item.product.image}`}
                          alt={item.product?.name}
                          style={{
                            width: "50px",
                            height: "50px",
                            objectFit: "cover",
                            borderRadius: "6px",
                          }}
                        />
                      )}
                      <div>
                        <div style={{ fontWeight: 500 }}>
                          {item.product?.name}
                        </div>
                        <div
                          style={{ fontSize: "0.8125rem", color: "#6b7280" }}
                        >
                          ID: {item.product_id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td
                    style={{
                      padding: "0.75rem",
                      textAlign: "center",
                      fontSize: "0.875rem",
                    }}
                  >
                    {item.quantity}
                  </td>
                  <td
                    style={{
                      padding: "0.75rem",
                      textAlign: "right",
                      fontSize: "0.875rem",
                    }}
                  >
                    {formatCurrency(item.price)}
                  </td>
                  <td
                    style={{
                      padding: "0.75rem",
                      textAlign: "right",
                      fontSize: "0.875rem",
                      fontWeight: 600,
                    }}
                  >
                    {formatCurrency(item.price * item.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div
        style={{
          background: "#f8fafc",
          padding: "1.5rem",
          borderRadius: "8px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "0.5rem",
          }}
        >
          <span style={{ fontSize: "0.9375rem" }}>Tạm tính:</span>
          <span style={{ fontSize: "0.9375rem" }}>
            {formatCurrency(order.subtotal_amount)}
          </span>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "0.5rem",
          }}
        >
          <span style={{ fontSize: "0.9375rem" }}>Phí vận chuyển:</span>
          <span style={{ fontSize: "0.9375rem" }}>
            {formatCurrency(order.shipping_fee)}
          </span>
        </div>
        {order.discount_amount > 0 && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "0.5rem",
            }}
          >
            <span style={{ fontSize: "0.9375rem" }}>Giảm giá:</span>
            <span style={{ fontSize: "0.9375rem", color: "#10b981" }}>
              -{formatCurrency(order.discount_amount)}
            </span>
          </div>
        )}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingTop: "0.5rem",
            borderTop: "2px solid #e2e8f0",
          }}
        >
          <span style={{ fontSize: "1.125rem", fontWeight: 600 }}>
            Tổng cộng:
          </span>
          <span
            style={{ fontSize: "1.125rem", fontWeight: 700, color: "#667eea" }}
          >
            {formatCurrency(order.total_amount)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ViewOrder;
