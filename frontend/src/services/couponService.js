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

const couponService = {
  applyCoupon: async ({ code, orderAmount }) => {
    const payload = {
      code: String(code || ""),
      order_amount: Number(orderAmount || 0),
    };

    const response = await axiosInstance.post("/api/coupons/apply", payload, {
      headers: authHeaders(),
    });

    return response.data;
  },
};

export default couponService;
