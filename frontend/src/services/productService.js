import axiosInstance from "./api";

const productService = {
  // Lấy tất cả sản phẩm
  getAllProducts: async () => {
    const response = await axiosInstance.get("/api/products/");
    return response.data.data;
  },

  // Lấy top sản phẩm bán chạy (week = từ Thứ 2 đến hiện tại, all = mọi thời điểm)
  getBestSellers: async ({ period = "week", limit = 4 } = {}) => {
    const response = await axiosInstance.get("/api/products/best-sellers", {
      params: { period, limit },
    });
    return response.data.data;
  },

  getBestSellersWeek: async ({ limit = 4 } = {}) => {
    return productService.getBestSellers({ period: "week", limit });
  },

  getBestSellersAllTime: async ({ limit = 4 } = {}) => {
    return productService.getBestSellers({ period: "all", limit });
  },

  // Lấy sản phẩm theo ID
  getProductById: async (id) => {
    const response = await axiosInstance.get(`/api/products/${id}`);
    return response.data.data;
  },

  // Tạo sản phẩm mới
  createProduct: async (productData, imageFile) => {
    const formData = new FormData();
    formData.append("name", productData.name);
    formData.append("description", productData.description);
    formData.append("short_description", productData.short_description);
    formData.append("price", productData.price);
    formData.append("sale_price", productData.sale_price);
    formData.append("quantity", productData.quantity);
    formData.append("tags", productData.tags);

    // Chỉ append category_id nếu có giá trị
    if (productData.category_id && productData.category_id !== "") {
      formData.append("category_id", productData.category_id);
    }

    if (imageFile) {
      formData.append("file", imageFile);
    }

    const response = await axiosInstance.post("/api/products/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data.data;
  },

  // Cập nhật sản phẩm
  updateProduct: async (id, productData, imageFile) => {
    const formData = new FormData();
    formData.append("name", productData.name);
    formData.append("description", productData.description);
    formData.append("short_description", productData.short_description);
    formData.append("price", productData.price);
    formData.append("sale_price", productData.sale_price);
    formData.append("quantity", productData.quantity);
    formData.append("tags", productData.tags);

    // Chỉ append category_id nếu có giá trị
    if (productData.category_id && productData.category_id !== "") {
      formData.append("category_id", productData.category_id);
    }

    if (imageFile) {
      formData.append("file", imageFile);
    }

    const response = await axiosInstance.put(
      `/api/products/${id}`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return response.data.data;
  },

  // Xóa sản phẩm
  deleteProduct: async (id) => {
    const response = await axiosInstance.delete(`/api/products/${id}`);
    return response.data;
  },
};

export default productService;
