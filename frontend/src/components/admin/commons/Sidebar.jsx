import { Link, NavLink, useNavigate } from "react-router-dom";
import "./sidebar.css";

import { Sidebar, Menu, MenuItem } from "react-pro-sidebar";
import {
  FaUser,
  FaAngleDoubleLeft,
  FaAngleDoubleRight,
  FaTachometerAlt,
  FaGem,
  FaRegLaughWink,
  FaHeart,
  FaSignOutAlt,
  FaComments,
} from "react-icons/fa";
import sidebarBg from "../../../assets/imgs/ad-timer.png";
import wishlistService from "../../../services/wishlistService";
import { clearAuthStorage } from "../../../services/authStorage";

const AppSidebar = ({
  image,
  collapsed,
  toggled,
  handleToggleSidebar,
  handleCollapsedChange,
}) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    const confirmLogout = window.confirm("Bạn có muốn đăng xuất không?");
    if (!confirmLogout) return;

    clearAuthStorage();
    try {
      wishlistService.notifyAuthChanged();
    } catch {
      // ignore
    }
    navigate("/login", { replace: true });
  };

  return (
    <Sidebar
      image={image ? sidebarBg : undefined}
      collapsed={collapsed}
      toggled={toggled}
      onBackdropClick={handleToggleSidebar}
      breakPoint="md"
    >
      {/* HEADER */}
      <Menu>
        <MenuItem
          icon={collapsed ? <FaAngleDoubleRight /> : <FaAngleDoubleLeft />}
          onClick={handleCollapsedChange}
        >
          {!collapsed && <strong>Admin Panel</strong>}
        </MenuItem>
      </Menu>

      {/* CONTENT */}
      <Menu>
        <MenuItem
          icon={<FaTachometerAlt />}
          component={<NavLink to="/admin" />}
        >
          Dashboard
        </MenuItem>

        <MenuItem icon={<FaGem />} component={<Link to="/admin/product" />}>
          Quản lý sản phẩm
        </MenuItem>

        <MenuItem
          icon={<FaRegLaughWink />}
          component={<Link to={"/admin/user"} />}
        >
          Quản lý người dùng
        </MenuItem>

        <MenuItem icon={<FaHeart />} component={<Link to={"/admin/order"} />}>
          Quản lý đơn hàng
        </MenuItem>

        <MenuItem
          icon={<FaComments />}
          component={<Link to={"/admin/livechat"} />}
        >
          Live Chat (CSKH)
        </MenuItem>
      </Menu>

      {/* FOOTER */}
      <Menu>
        <MenuItem icon={<FaUser />} component={<Link to="/admin/profile" />}>
          Xem hồ sơ
        </MenuItem>
        <MenuItem icon={<FaSignOutAlt />} onClick={handleLogout}>
          Đăng xuất
        </MenuItem>
      </Menu>
    </Sidebar>
  );
};

export default AppSidebar;
