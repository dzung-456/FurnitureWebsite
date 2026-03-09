import axiosInstance from "./api";

const dashboardService = {
  // Lấy thống kê dashboard
  getDashboardStats: async () => {
    const response = await axiosInstance.get("/api/dashboard/stats");
    return response.data.data;
  },
};

export default dashboardService;