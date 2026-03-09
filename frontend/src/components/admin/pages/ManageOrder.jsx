import React, { useState, useEffect } from "react";
import OrderHeader from "../manage_order/OrderHeader";
import OrderControls from "../manage_order/OrderControls";
import OrderTable from "../manage_order/OrderTable";
import Pagination from "../manage_product/Pagination";
import ViewOrder from "../manage_order/ViewOrder";
import orderService from "../../../services/orderService";
import "./ManageOrder.css";

const ManageOrder = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewingOrderId, setViewingOrderId] = useState(null);

  const ITEMS_PER_PAGE = 5;

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await orderService.getAllOrders();
      setOrders(data || []);
    } catch (error) {
      console.error("Lỗi khi lấy đơn hàng:", error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrder = (id) => {
    setViewingOrderId(id);
  };

  const handleCloseView = () => {
    setViewingOrderId(null);
  };

  const handleUpdateStatus = async (orderId, status) => {
    try {
      await orderService.updateOrderStatus(orderId, status);
      fetchOrders();
      alert("Cập nhật trạng thái thành công!");
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái:", error);
      alert("Cập nhật trạng thái thất bại!");
    }
  };

  const handleUpdatePaymentStatus = async (orderId, paymentStatus) => {
    try {
      await orderService.updatePaymentStatus(orderId, paymentStatus);
      fetchOrders();
      alert("Cập nhật trạng thái thanh toán thành công!");
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái thanh toán:", error);
      alert("Cập nhật trạng thái thanh toán thất bại!");
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchSearch =
      order.id.toString().includes(searchTerm) ||
      order.shipping_fullname
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      order.shipping_email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = !statusFilter || order.status === statusFilter;
    const matchPaymentStatus =
      !paymentStatusFilter || order.payment_status === paymentStatusFilter;
    return matchSearch && matchStatus && matchPaymentStatus;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentOrders = filteredOrders.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, paymentStatusFilter]);

  if (loading) {
    return (
      <div className="manage-order">
        <div style={{ textAlign: "center", padding: "3rem" }}>
          <p style={{ fontSize: "1.2rem", color: "#667eea" }}>
            Đang tải dữ liệu...
          </p>
        </div>
      </div>
    );
  }

  if (viewingOrderId) {
    return (
      <div className="manage-order">
        <ViewOrder
          orderId={viewingOrderId}
          onClose={handleCloseView}
        />
      </div>
    );
  }

  return (
    <div className="manage-order">
      <OrderHeader />
      <OrderControls
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onStatusChange={setStatusFilter}
        onPaymentStatusChange={setPaymentStatusFilter}
      />
      <OrderTable
        orders={currentOrders}
        onView={handleViewOrder}
        onUpdateStatus={handleUpdateStatus}
        onUpdatePaymentStatus={handleUpdatePaymentStatus}
      />
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
};

export default ManageOrder;
