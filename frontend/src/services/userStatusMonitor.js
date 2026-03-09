import { getToken } from "./authStorage";
import axiosInstance from "./api";

let pollingInterval = null;

const userStatusMonitor = {
  // Bắt đầu kiểm tra status user định kỳ
  startMonitoring: () => {
    // Nếu đã có interval thì không tạo mới
    if (pollingInterval) return;

    // Kiểm tra mỗi 10 giây
    pollingInterval = setInterval(async () => {
      const token = getToken();

      // Nếu không có token thì dừng monitoring
      if (!token) {
        userStatusMonitor.stopMonitoring();
        return;
      }

      try {
        // Gọi API để lấy thông tin user hiện tại
        await axiosInstance.get("/api/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (error) {
        // Nếu có lỗi 403 (banned), interceptor sẽ tự động xử lý
        if (error.response?.status === 403) {
          userStatusMonitor.stopMonitoring();
        }
      }
    }, 10000); // 10 giây
  },

  // Dừng monitoring
  stopMonitoring: () => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      pollingInterval = null;
    }
  },
};

export default userStatusMonitor;
