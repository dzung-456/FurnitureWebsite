import React, { useState, useEffect } from "react";
import { FaUsers, FaBox, FaShoppingCart, FaTrophy, FaDollarSign } from "react-icons/fa";
import dashboardService from "../../../services/dashboardService";

const DashBoard = () => {
  const [stats, setStats] = useState({
    total_products: 0,
    total_users: 0,
    total_orders: 0,
    total_revenue: 0,
    top_products: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await dashboardService.getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error("Lỗi khi lấy thống kê:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  if (loading) {
    return (
      <div style={{ padding: "2rem", background: "#f7fafc", minHeight: "100vh" }}>
        <div style={{ textAlign: "center", padding: "3rem" }}>
          <p style={{ fontSize: "1.2rem", color: "#667eea" }}>
            Đang tải dữ liệu...
          </p>
        </div>
      </div>
    );
  }

  const cardStyle = {
    background: "white",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
    padding: "1.5rem",
    display: "flex",
    alignItems: "center",
    gap: "1rem"
  };

  const iconStyle = {
    width: "60px",
    height: "60px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.5rem",
    color: "white"
  };

  return (
    <div style={{ padding: "2rem", background: "#f7fafc", minHeight: "100vh" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 700, color: "#2d3748", margin: 0 }}>
          Dashboard
        </h1>
        <p style={{ color: "#718096", margin: "0.5rem 0 0 0", fontSize: "0.9375rem" }}>
          Tổng quan hệ thống quản lý
        </p>
      </div>

      {/* Stats Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
        <div style={cardStyle}>
          <div style={{ ...iconStyle, background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
            <FaBox />
          </div>
          <div>
            <h3 style={{ fontSize: "2rem", fontWeight: 700, color: "#2d3748", margin: 0 }}>
              {stats.total_products}
            </h3>
            <p style={{ color: "#718096", margin: 0, fontSize: "0.875rem" }}>Sản phẩm</p>
          </div>
        </div>

        <div style={cardStyle}>
          <div style={{ ...iconStyle, background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" }}>
            <FaUsers />
          </div>
          <div>
            <h3 style={{ fontSize: "2rem", fontWeight: 700, color: "#2d3748", margin: 0 }}>
              {stats.total_users}
            </h3>
            <p style={{ color: "#718096", margin: 0, fontSize: "0.875rem" }}>Người dùng</p>
          </div>
        </div>

        <div style={cardStyle}>
          <div style={{ ...iconStyle, background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)" }}>
            <FaShoppingCart />
          </div>
          <div>
            <h3 style={{ fontSize: "2rem", fontWeight: 700, color: "#2d3748", margin: 0 }}>
              {stats.total_orders}
            </h3>
            <p style={{ color: "#718096", margin: 0, fontSize: "0.875rem" }}>Đơn hàng</p>
          </div>
        </div>

        <div style={cardStyle}>
          <div style={{ ...iconStyle, background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)" }}>
            <FaDollarSign />
          </div>
          <div>
            <h3 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#2d3748", margin: 0 }}>
              {formatCurrency(stats.total_revenue)}
            </h3>
            <p style={{ color: "#718096", margin: 0, fontSize: "0.875rem" }}>Doanh thu</p>
          </div>
        </div>
      </div>

      {/* Top Products */}
      <div style={{ background: "white", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)", padding: "1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.5rem" }}>
          <FaTrophy style={{ color: "#f59e0b", fontSize: "1.25rem" }} />
          <h2 style={{ fontSize: "1.25rem", fontWeight: 600, color: "#2d3748", margin: 0 }}>
            Top 5 Sản Phẩm Bán Chạy
          </h2>
        </div>
        
        {stats.top_products.length > 0 ? (
          <div style={{ display: "grid", gap: "1rem" }}>
            {stats.top_products.map((product, index) => (
              <div key={product.id} style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: "1rem", 
                padding: "1rem", 
                background: "#f8fafc", 
                borderRadius: "8px",
                border: index === 0 ? "2px solid #f59e0b" : "1px solid #e2e8f0"
              }}>
                <div style={{ 
                  background: index === 0 ? "#f59e0b" : "#667eea",
                  color: "white",
                  width: "30px",
                  height: "30px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.875rem",
                  fontWeight: 600
                }}>
                  {index + 1}
                </div>
                
                {product.image && (
                  <img 
                    src={`/uploads/products/${product.image}`} 
                    alt={product.name}
                    style={{ width: "50px", height: "50px", objectFit: "cover", borderRadius: "6px" }}
                  />
                )}
                
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: "0.9375rem", fontWeight: 600, color: "#2d3748", margin: 0 }}>
                    {product.name}
                  </h4>
                  <p style={{ fontSize: "0.8125rem", color: "#718096", margin: "0.25rem 0 0 0" }}>
                    Giá: {formatCurrency(product.sale_price > 0 ? product.sale_price : product.price)}
                  </p>
                </div>
                
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "1.125rem", fontWeight: 700, color: "#2d3748" }}>
                    {product.total_sold}
                  </div>
                  <div style={{ fontSize: "0.8125rem", color: "#718096" }}>
                    đã bán
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "2rem", color: "#718096" }}>
            <p>Chưa có dữ liệu bán hàng</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashBoard;
