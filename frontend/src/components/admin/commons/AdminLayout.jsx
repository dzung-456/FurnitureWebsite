import React, { useState } from "react";
import Header from "./Header";
import Footer from "./Footer";
import { Outlet } from "react-router";
import AppSidebar from "./Sidebar";

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [toggled, setToggled] = useState(false);

  const handleCollapsedChange = () => {
    setCollapsed(!collapsed);
  };

  const handleToggleSidebar = () => {
    setToggled(!toggled);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex flex-1">
        <AppSidebar
          collapsed={collapsed}
          toggled={toggled}
          handleCollapsedChange={handleCollapsedChange}
          handleToggleSidebar={handleToggleSidebar}
        />
        <div className="flex-1 bg-gray-100">
          <Outlet />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AdminLayout;
