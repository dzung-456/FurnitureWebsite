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

const reviewService = {
  getProductReviews: async (productId) => {
    const response = await axiosInstance.get(
      `/api/reviews/product/${productId}`
    );
    return response.data;
  },

  createReview: async ({ productId, rating, comment }) => {
    const payload = {
      product_id: Number(productId),
      rating: Number(rating),
      comment: comment || null,
    };
    const response = await axiosInstance.post("/api/reviews/", payload, {
      headers: authHeaders(),
    });
    return response.data;
  },
};

export default reviewService;
