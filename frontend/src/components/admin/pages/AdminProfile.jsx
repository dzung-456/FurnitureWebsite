import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAuthSnapshot,
  getLoginAt,
  setAuth,
} from "../../../services/authStorage";
import "./AdminProfile.css";

const AdminProfile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [phone, setPhone] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [preview, setPreview] = useState(null);
  const [msg, setMsg] = useState("");
  const [errorType, setErrorType] = useState(""); // success or error

  const resolveAvatarSrc = (value) => {
    if (!value) return null;
    if (/^https?:\/\//i.test(value)) return value;
    return `/uploads/avatars/${value}`;
  };

  useEffect(() => {
    const { token, user: storedUser } = getAuthSnapshot();
    if (!token) {
      navigate("/login");
      return;
    }
    setUser({ ...(storedUser || {}), token });
    setPhone("");
    fetchProfile(token);
  }, []);

  const fetchProfile = async (token) => {
    try {
      const res = await fetch("/api/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.code === "200") {
        setUser({ ...data.data, token });
        setPhone(data.data.phone || "");
        const loginAt = getLoginAt() || Date.now();
        setAuth({ token, user: data.data, loginAt });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setMsg("");
    setErrorType("");

    const formData = new FormData();
    formData.append("phone", phone);
    if (avatar) {
      formData.append("avatar", avatar);
    }

    try {
      const res = await fetch("/api/me", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
        body: formData,
      });
      const data = await res.json();
      if (data.code === "200") {
        setMsg("Cập nhật thông tin thành công!");
        setErrorType("success");
        const updatedUser = { ...user, ...data.data, loginAt: user?.loginAt };
        setUser(updatedUser);
        const loginAt = getLoginAt() || updatedUser?.loginAt || Date.now();
        setAuth({ token: user?.token, user: updatedUser, loginAt });
      } else {
        setMsg(data.message || "Cập nhật thất bại");
        setErrorType("error");
      }
    } catch (error) {
      setMsg("Lỗi Server");
      setErrorType("error");
    }
  };

  if (loading)
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );

  return (
    <div className="admin-profile-container d-flex align-items-center justify-content-center">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-8 col-xl-6">
            <div className="card admin-profile-card">
              {/* Header Background */}
              <div className="profile-header-bg"></div>

              {/* Avatar Section */}
              <div className="profile-avatar-container">
                {preview ? (
                  <img src={preview} alt="Avatar" className="profile-avatar" />
                ) : user?.avatar ? (
                  <img
                    src={resolveAvatarSrc(user.avatar)}
                    alt="Avatar"
                    className="profile-avatar"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "flex";
                    }}
                  />
                ) : (
                  <div className="profile-avatar-placeholder">
                    {user?.username?.[0]?.toUpperCase()}
                  </div>
                )}

                {/* Overlay for upload */}
                <label className="avatar-overlay">
                  <i className="fas fa-camera camera-icon"></i>
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </label>
              </div>

              {/* Profile Body */}
              <div className="profile-form">
                <h2 className="profile-title">{user?.full_name || "Admin"}</h2>

                {msg && (
                  <div
                    className={`alert ${errorType === "success" ? "alert-success" : "alert-danger"
                      } text-center mb-4`}
                    role="alert"
                  >
                    {msg}
                  </div>
                )}

                <form onSubmit={handleUpdate}>
                  <div className="row">
                    <div className="col-md-6 form-group-custom">
                      <label className="form-label-custom">Tên đăng nhập</label>
                      <input
                        type="text"
                        className="form-control-custom"
                        value={user?.username || ""}
                        disabled
                      />
                    </div>
                    <div className="col-md-6 form-group-custom">
                      <label className="form-label-custom">Email</label>
                      <input
                        type="email"
                        className="form-control-custom"
                        value={user?.email || ""}
                        disabled
                      />
                    </div>
                  </div>

                  <div className="form-group-custom">
                    <label className="form-label-custom">Họ và tên</label>
                    <input
                      type="text"
                      className="form-control-custom"
                      value={user?.full_name || ""}
                      disabled
                    />
                  </div>

                  <div className="form-group-custom">
                    <label className="form-label-custom">Số điện thoại</label>
                    <input
                      type="text"
                      className="form-control-custom"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Nhập số điện thoại"
                    />
                  </div>

                  <button type="submit" className="update-btn">
                    Cập nhật hồ sơ
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
