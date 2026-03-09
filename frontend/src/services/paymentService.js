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

const paymentService = {
  isAuthenticated: () => !!getToken(),

  createVnpayPayment: async (orderId) => {
    const response = await axiosInstance.post(
      "/api/payments/vnpay/create",
      { order_id: orderId },
      { headers: authHeaders() }
    );
    return response.data;
  },

  confirmVnpayPayment: async (params) => {
    const response = await axiosInstance.post(
      "/api/payments/vnpay/confirm",
      { params },
      { headers: authHeaders() }
    );
    return response.data;
  },

  createPaypalOrder: async (orderId) => {
    const response = await axiosInstance.post(
      "/api/payments/paypal/create",
      { order_id: orderId },
      { headers: authHeaders() }
    );
    return response.data;
  },

  capturePaypalOrder: async ({ orderId, paypalOrderId }) => {
    const response = await axiosInstance.post(
      "/api/payments/paypal/capture",
      { order_id: orderId, paypal_order_id: paypalOrderId },
      { headers: authHeaders() }
    );
    return response.data;
  },
};

export default paymentService;
