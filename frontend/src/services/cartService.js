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

const dispatchCartUpdated = () => {
  if (typeof window !== "undefined" && window?.dispatchEvent) {
    window.dispatchEvent(new Event("cart:updated"));
  }
};

const cartService = {
  isAuthenticated: () => !!getToken(),

  getCart: async () => {
    const response = await axiosInstance.get("/api/cart/", {
      headers: authHeaders(),
    });
    return response.data;
  },

  addItem: async (productId, quantity = 1) => {
    const payload = {
      product_id: Number(productId),
      quantity: Math.max(1, Number(quantity) || 1),
    };
    const response = await axiosInstance.post("/api/cart/items", payload, {
      headers: authHeaders(),
    });
    dispatchCartUpdated();
    return response.data;
  },

  updateItemQuantity: async (itemId, quantity) => {
    const payload = {
      quantity: Math.max(0, Number(quantity) || 0),
    };
    const response = await axiosInstance.put(
      `/api/cart/items/${itemId}`,
      payload,
      {
        headers: authHeaders(),
      }
    );
    dispatchCartUpdated();
    return response.data;
  },

  removeItem: async (itemId) => {
    const response = await axiosInstance.delete(`/api/cart/items/${itemId}`, {
      headers: authHeaders(),
    });
    dispatchCartUpdated();
    return response.data;
  },

  clearCart: async () => {
    const response = await axiosInstance.delete("/api/cart/clear", {
      headers: authHeaders(),
    });
    dispatchCartUpdated();
    return response.data;
  },
};

export default cartService;
