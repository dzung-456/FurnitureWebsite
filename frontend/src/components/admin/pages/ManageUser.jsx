import React, { useState, useEffect } from "react";
import UserHeader from "../manage_user/UserHeader";
import UserControls from "../manage_user/UserControls";
import UserTable from "../manage_user/UserTable";
import Pagination from "../manage_product/Pagination";
import AddUser from "../manage_user/AddUser";
import EditUser from "../manage_user/EditUser";
import ViewUser from "../manage_user/ViewUser";
import userService from "../../../services/userService";

const ManageUser = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [viewingUserId, setViewingUserId] = useState(null);

  const ITEMS_PER_PAGE = 5;

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getAllUsers();
      setUsers(data || []);
    } catch (error) {
      console.error("Lỗi khi lấy người dùng:", error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = () => {
    setShowAddForm(true);
  };

  const handleSubmitUser = async (userData, avatarFile) => {
    try {
      await userService.createUser(userData, avatarFile);
      setShowAddForm(false);
      fetchUsers();
      alert("Thêm người dùng thành công!");
    } catch (error) {
      console.error("Lỗi khi thêm người dùng:", error);
      let errorMessage = "Thêm người dùng thất bại!";
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      }
      alert(errorMessage);
      throw error;
    }
  };

  const handleCancelAdd = () => {
    setShowAddForm(false);
  };

  const handleViewUser = (id) => {
    setViewingUserId(id);
  };

  const handleCloseView = () => {
    setViewingUserId(null);
  };

  const handleEditUser = (id) => {
    setViewingUserId(null);
    setEditingUserId(id);
  };

  const handleSubmitEdit = async (userData, avatarFile) => {
    try {
      await userService.updateUser(editingUserId, userData, avatarFile);
      setEditingUserId(null);
      fetchUsers();
      alert("Cập nhật người dùng thành công!");
    } catch (error) {
      console.error("Lỗi khi cập nhật người dùng:", error);
      alert("Cập nhật người dùng thất bại!");
    }
  };

  const handleCancelEdit = () => {
    setEditingUserId(null);
  };

  const handleDeleteUser = async (id) => {
    // Confirmation dialog to prevent accidental deletion
    if (!window.confirm("Bạn có chắc chắn muốn xóa người dùng này không? Hành động này không thể hoàn tác!")) {
      return;
    }

    try {
      await userService.deleteUser(id);
      setViewingUserId(null);
      fetchUsers();
      alert("Xóa người dùng thành công!");
    } catch (error) {
      console.error("Lỗi khi xóa người dùng:", error);
      alert("Xóa người dùng thất bại!");
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchSearch =
      user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchRole = !roleFilter || user.role === roleFilter;
    const matchStatus = !statusFilter || user.status === statusFilter;
    return matchSearch && matchRole && matchStatus;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, roleFilter, statusFilter]);

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

  if (showAddForm) {
    return (
      <div style={{ padding: "2rem", background: "#f7fafc", minHeight: "100vh" }}>
        <AddUser onSubmit={handleSubmitUser} onCancel={handleCancelAdd} />
      </div>
    );
  }

  if (viewingUserId) {
    return (
      <div style={{ padding: "2rem", background: "#f7fafc", minHeight: "100vh" }}>
        <ViewUser
          userId={viewingUserId}
          onClose={handleCloseView}
          onEdit={handleEditUser}
          onDelete={handleDeleteUser}
        />
      </div>
    );
  }

  if (editingUserId) {
    return (
      <div style={{ padding: "2rem", background: "#f7fafc", minHeight: "100vh" }}>
        <EditUser
          userId={editingUserId}
          onSubmit={handleSubmitEdit}
          onCancel={handleCancelEdit}
        />
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem", background: "#f7fafc", minHeight: "100vh" }}>
      <UserHeader onAddClick={handleAddUser} />
      <UserControls
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onRoleChange={setRoleFilter}
        onStatusChange={setStatusFilter}
      />
      <UserTable
        users={currentUsers}
        onView={handleViewUser}
        onEdit={handleEditUser}
        onDelete={handleDeleteUser}
      />
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
};

export default ManageUser;