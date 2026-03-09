// src/components/AdminRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const AdminRoute = () => {
    const { user, isLoading } = useAuth();

    console.log("--- ADMIN ROUTE CHECK ---");
    console.log("1. Is Loading:", isLoading);
    console.log("2. Full User Object:", user);
    console.log("3. User Role:", user?.role);

    if (isLoading) {
        return <div>Đang kiểm tra quyền...</div>;
    }

    if (user && user.role === 'admin') {
        return <Outlet />;
    }

    console.warn(">>> BỊ CHẶN: User không hợp lệ hoặc Role không phải admin");
    return <Navigate to="/" replace />;
};

export default AdminRoute;