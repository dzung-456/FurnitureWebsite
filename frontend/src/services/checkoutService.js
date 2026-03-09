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

const checkoutService = {
  isAuthenticated: () => !!getToken(),

  createOrder: async (payload) => {
    const response = await axiosInstance.post("/api/checkout/", payload, {
      headers: authHeaders(),
    });
    return response.data;
  },
};

export default checkoutService;
