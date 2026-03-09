import axios from "axios";
import { clearAuthStorage,getToken } from "./authStorage";
import wishlistService from "./wishlistService";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});
// Interceptor để tự động gắn Bearer token (nếu có)
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers = config.headers || {};
      // Không overwrite nếu caller đã set Authorization riêng
      if (!config.headers.Authorization && !config.headers.authorization) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);
// Flag để đảm bảo chỉ logout 1 lần
let isLoggingOut = false;

// Interceptor để xử lý lỗi 403 (user bị banned)
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 403 && !isLoggingOut) {
      const detail = error.response.data?.detail;

      // Nếu user bị banned hoặc tài khoản bị vô hiệu hóa
      if (
        detail === "Tài khoản đã bị cấm" ||
        detail === "Tài khoản đã bị xóa hoặc vô hiệu hóa"
      ) {
        isLoggingOut = true;

        // Clear auth storage
        clearAuthStorage();
        wishlistService.clearLocalWishlist();
        wishlistService.notifyAuthChanged();

        // Dispatch event để các component khác biết
        if (typeof window !== "undefined" && window?.dispatchEvent) {
          window.dispatchEvent(new Event("cart:updated"));
        }

        // Hiển thị thông báo và chuyển về trang chủ
        alert(detail);
        window.location.href = "/";

        // Reset flag sau 2 giây
        setTimeout(() => {
          isLoggingOut = false;
        }, 2000);
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
