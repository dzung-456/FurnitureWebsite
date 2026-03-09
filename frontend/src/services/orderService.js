import axiosInstance from "./api";

const getToken = () => {
  try {
    const direct = localStorage.getItem("token");
    if (direct) return direct;
    const raw = localStorage.getItem("user");
    if (!raw) return "";
    const user = JSON.parse(raw);
    return user?.token || "";
  } catch {
    return "";
  }
};

const authHeaders = () => {
  const token = getToken();
  if (!token) {
    const err = new Error("NOT_AUTHENTICATED");
    err.code = "NOT_AUTHENTICATED";
    throw err;
  }
  return { Authorization: `Bearer ${token}` };
};

const orderService = {
  // Lấy tất cả đơn hàng
  getAllOrders: async () => {
    const response = await axiosInstance.get("/api/orders", {
      headers: authHeaders(),
    });
    return response.data.data;
  },

  // Lấy đơn hàng của user hiện tại (tab: 'status' | 'history')
  getOrders: async (status) => {
    const response = await axiosInstance.get("/api/checkout/orders", {
      headers: authHeaders(),
      params: status ? { status } : undefined,
    });
    return response.data.data;
  },

  // Lấy đơn hàng theo ID
  getOrderById: async (id) => {
    const response = await axiosInstance.get(`/api/orders/${id}`, {
      headers: authHeaders(),
    });
    return response.data.data;
  },

  // Lấy chi tiết đơn hàng của user hiện tại theo ID
  getMyOrderById: async (id) => {
    const response = await axiosInstance.get(`/api/checkout/orders/${id}`, {
      headers: authHeaders(),
    });
    return response.data.data;
  },

  // Hủy đơn hàng của user hiện tại (chỉ pending/processing)
  cancelMyOrder: async (id) => {
    const response = await axiosInstance.put(
      `/api/checkout/orders/${id}/cancel`,
      null,
      {
        headers: authHeaders(),
      }
    );
    return response.data.data;
  },

  // Cập nhật trạng thái đơn hàng
  updateOrderStatus: async (id, status) => {
    console.log(`Updating order ${id} to status ${status}`);
    try {
      const response = await axiosInstance.put(
        `/api/orders/${id}/status?status=${status}`,
        null,
        {
          headers: authHeaders(),
        }
      );
      console.log("Update response:", response.data);
      return response.data.data;
    } catch (error) {
      console.error(
        "Update order status error:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  // Cập nhật trạng thái thanh toán
  updatePaymentStatus: async (id, paymentStatus) => {
    console.log(`Updating order ${id} payment_status to ${paymentStatus}`);
    try {
      const response = await axiosInstance.put(
        `/api/orders/${id}/payment-status?payment_status=${paymentStatus}`,
        null,
        {
          headers: authHeaders(),
        }
      );
      return response.data.data;
    } catch (error) {
      console.error(
        "Update payment status error:",
        error.response?.data || error.message
      );
      throw error;
    }
  },
};

export default orderService;
