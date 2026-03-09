import React from "react";
import { Link } from "react-router-dom";
import orderService from "../../services/orderService";

const OrderList = ({ orders, type, onChanged }) => {
  if (!orders || orders.length === 0) {
    return (
      <div className="text-center py-5">
        <i className="far fa-folder-open fa-3x mb-3 text-muted"></i>
        <p className="lead">Không có đơn hàng nào.</p>
        <Link to="/productsList" className="fill-btn mt-3">
          <span className="fill-btn-inner">
            <span className="fill-btn-normal">Mua sắm ngay</span>
            <span className="fill-btn-hover">Mua sắm ngay</span>
          </span>
        </Link>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "delivered":
      case "completed":
        return <span className="badge bg-success fs-4">Hoàn thành</span>;
      case "pending":
      case "unpaid":
        return (
          <span className="badge bg-warning text-dark fs-4">Chờ xử lý</span>
        );
      case "processing":
        return <span className="badge bg-primary fs-4">Đang xử lý</span>;
      case "shipped":
        return <span className="badge bg-info text-dark fs-4">Đang giao</span>;
      case "cancelled":
        return <span className="badge bg-danger fs-4">Đã hủy</span>;
      default:
        return <span className="badge bg-secondary fs-4">{status}</span>;
    }
  };

  const getProductImage = (item) => {
    const image = item?.product?.image;
    if (!image) return "/no-image.svg";

    // DB typically stores just the filename; files live under public/uploads/products
    if (
      typeof image === "string" &&
      (image.startsWith("http") || image.startsWith("/"))
    ) {
      return image;
    }
    return `/uploads/products/${image}`;
  };

  return (
    <div className="order-list">
      {orders.map((order) => (
        <div key={order.id} className="card shadow-sm mb-3 border-0">
          <div className="card-header bg-white d-flex justify-content-between align-items-center py-3">
            <div>
              <span className="fw-bold me-2">Mã đơn: {order.id}</span>
              <span className="text-muted small">
                - Ngày đặt:{" "}
                {new Date(
                  order.order_date || order.created_at
                ).toLocaleDateString("vi-VN")}
              </span>
            </div>
            <div>{getStatusBadge(order.status)}</div>
          </div>
          <div className="card-body">
            {order.items &&
              order.items.slice(0, 2).map((item) => (
                <div key={item.id} className="d-flex align-items-center mb-3">
                  <div
                    style={{
                      width: "80px",
                      height: "80px",
                      overflow: "hidden",
                      borderRadius: "8px",
                      flexShrink: 0,
                    }}
                    className="me-3 bg-light"
                  >
                    <img
                      src={getProductImage(item) || "/no-image.svg"}
                      alt={item.product?.name || "Product"}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                      onError={(e) => {
                        e.currentTarget.src = "/no-image.svg";
                      }}
                    />
                  </div>
                  <div className="flex-grow-1">
                    <h6 className="mb-1">
                      {item.product?.name || "Sản phẩm không còn tồn tại"}
                    </h6>
                    <p className="mb-0 text-muted small">
                      x{item.quantity} - {item.price.toLocaleString("vi-VN")}đ
                    </p>
                  </div>
                </div>
              ))}
            {order.items && order.items.length > 2 && (
              <div className="text-muted small mb-2">
                Xem thêm {order.items.length - 2} sản phẩm khác...
              </div>
            )}

            <hr />

            <div className="d-flex justify-content-between align-items-end">
              <div>
                <span className="text-muted">Tổng tiền: </span>
                <span className="fw-bold text-primary fs-5">
                  {(order.total_amount || 0).toLocaleString("vi-VN")}đ
                </span>
              </div>
              <div>
                {type === "status" &&
                  (order.status === "pending" ||
                    order.status === "processing") && (
                    <button
                      type="button"
                      className="btn btn-outline-danger btn-sm fs-4 me-2"
                      onClick={async () => {
                        const ok = window.confirm(
                          `Bạn có chắc muốn hủy đơn #${order.id} không?`
                        );
                        if (!ok) return;
                        try {
                          await orderService.cancelMyOrder(order.id);
                          onChanged?.();
                        } catch (error) {
                          console.error("Failed to cancel order", error);
                          alert(
                            "Hủy đơn thất bại. Vui lòng thử lại hoặc kiểm tra trạng thái đơn."
                          );
                        }
                      }}
                    >
                      Hủy đơn
                    </button>
                  )}
                <Link
                  to={`/order-detail/${order.id}`}
                  className="btn btn-outline-primary btn-sm fs-4"
                >
                  Xem chi tiết
                </Link>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default OrderList;
