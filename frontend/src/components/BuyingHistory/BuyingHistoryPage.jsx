import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "../commons/Header";
import Footer from "../commons/Footer";
import Offcanvas from "../commons/OffCanvas";
import OrderList from "./OrderList";
import orderService from "../../services/orderService";
import bg from "../../assets/imgs/breadcrumb-bg-furniture.jpg";

const BuyingHistoryPage = ({ showOffcanvas, setShowOffcanvas }) => {
  const [activeTab, setActiveTab] = useState("status"); // 'status' or 'history'
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    fetchOrders();
  }, [activeTab]);

  useEffect(() => {
    setStatusFilter("");
  }, [activeTab]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await orderService.getOrders(activeTab);
      setOrders(data || []);
    } catch (error) {
      console.error("Failed to fetch orders", error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const displayedOrders = statusFilter
    ? (orders || []).filter((o) => String(o?.status || "") === statusFilter)
    : orders;

  return (
    <>
      <Header onOpenOffcanvas={() => setShowOffcanvas(true)} />
      <Offcanvas show={showOffcanvas} onClose={() => setShowOffcanvas(false)} />

      <main>
        {/* Breadcrumb area */}
        <section className="breadcrumb__area theme-bg-1 p-relative z-index-11 pt-95 pb-95">
          <div
            className="breadcrumb__thumb"
            style={{ backgroundImage: `url(${bg})` }}
          ></div>
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-xxl-12">
                <div className="breadcrumb__wrapper text-center">
                  <h2 className="breadcrumb__title">Đơn hàng của tôi</h2>
                  <div className="breadcrumb__menu">
                    <nav>
                      <ul>
                        <li>
                          <span>
                            <Link to="/">Trang chủ</Link>
                          </span>
                        </li>
                        <li>
                          <span>Đơn hàng của tôi</span>
                        </li>
                      </ul>
                    </nav>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* Buying History Section */}
        <section className="buying-history-area pb-100">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-xl-10">
                <div className="cart-page-title mb-30">
                  <h3 style={{ textAlign: "center", marginTop: "20px" }}>
                    Đơn hàng của tôi
                  </h3>
                </div>
              </div>
              <div className="col-xl-10">
                <div className="buying-history-tabs mb-40">
                  <ul className="nav nav-tabs nav-fill" role="tablist">
                    <li className="nav-item">
                      <button
                        className={`nav-link ${
                          activeTab === "status" ? "active" : ""
                        }`}
                        onClick={() => setActiveTab("status")}
                        type="button"
                        style={{ fontWeight: "bold", fontSize: "16px" }}
                      >
                        Trạng thái đơn hàng
                      </button>
                    </li>
                    <li className="nav-item">
                      <button
                        className={`nav-link ${
                          activeTab === "history" ? "active" : ""
                        }`}
                        onClick={() => setActiveTab("history")}
                        type="button"
                        style={{ fontWeight: "bold", fontSize: "16px" }}
                      >
                        Lịch sử mua hàng
                      </button>
                    </li>
                  </ul>
                </div>

                <div className="d-flex justify-content-end mb-3">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="form-select fs-4"
                    style={{ maxWidth: 260 }}
                  >
                    <option value="">Tất cả trạng thái</option>
                    <option value="pending">Chờ xử lý</option>
                    <option value="processing">Đang xử lý</option>
                    <option value="shipped">Đang giao</option>
                    <option value="delivered">Hoàn thành</option>
                    <option value="cancelled">Đã hủy</option>
                  </select>
                </div>

                <div className="tab-content">
                  {loading ? (
                    <div className="text-center py-5">
                      <div
                        className="spinner-border text-primary"
                        role="status"
                      >
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  ) : (
                    <OrderList
                      orders={displayedOrders}
                      type={activeTab}
                      onChanged={fetchOrders}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default BuyingHistoryPage;
