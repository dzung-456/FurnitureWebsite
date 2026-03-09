import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../commons/Header";
import Footer from "../../commons/Footer";
import Offcanvas from "../../commons/OffCanvas";
import {
  getAuthSnapshot,
  getLoginAt,
  setAuth,
} from "../../../services/authStorage";

const Profile = ({ showOffcanvas, setShowOffcanvas }) => {
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

  if (loading) return <div className="text-center mt-5">Loading...</div>;

  return (
    <>
      <Header onOpenOffcanvas={() => setShowOffcanvas(true)} />
      <Offcanvas show={showOffcanvas} onClose={() => setShowOffcanvas(false)} />

      <div
        className="container"
        style={{ marginTop: "20px", marginBottom: "50px" }}
      >
        <div className="row justify-content-center">
          <div className="col-lg-6 col-md-8">
            <div className="card shadow-sm border-1">
              <div className="card-body p-5">
                <h2 className="mb-4 text-center fw-bold">Hồ Sơ Của Tôi</h2>
                {msg && (
                  <div
                    className={`alert ${
                      errorType === "success" ? "alert-success" : "alert-danger"
                    } text-center`}
                  >
                    {msg}
                  </div>
                )}

                <form onSubmit={handleUpdate}>
                  <div className="text-center mb-4">
                    <div
                      style={{
                        width: 150,
                        height: 150,
                        borderRadius: "50%",
                        background: "#f8f9fa",
                        margin: "0 auto",
                        overflow: "hidden",
                        position: "relative",
                        border: "3px solid #e9ecef",
                      }}
                    >
                      {preview ? (
                        <img
                          src={preview}
                          alt="Avatar"
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      ) : user?.avatar ? (
                        <img
                          src={resolveAvatarSrc(user.avatar)}
                          alt="Avatar"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.style.display = "none";
                            e.target.nextSibling.style.display = "flex";
                          }}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            height: "100%",
                            fontSize: "3rem",
                            color: "#adb5bd",
                          }}
                        >
                          {user?.username?.[0]?.toUpperCase()}
                        </div>
                      )}

                      {/* Fallback container for error loading, simplified above approach or just keep logic simple */}
                      {user?.avatar && (
                        <div
                          className="fallback-avatar"
                          style={{
                            display: "none",
                            alignItems: "center",
                            justifyContent: "center",
                            height: "100%",
                            fontSize: "3rem",
                            color: "#adb5bd",
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                          }}
                        >
                          <i className="fas fa-user"></i>
                        </div>
                      )}
                    </div>
                    <div className="mt-3">
                      <label className="btn btn-outline-primary btn-sm fs-3">
                        <i className="fas fa-camera me-2"></i>Chọn ảnh
                        <input
                          type="file"
                          hidden
                          accept="image/*"
                          onChange={handleFileChange}
                        />
                      </label>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-bold">Tên đăng nhập</label>
                    <input
                      type="text"
                      className="form-control"
                      value={user?.username || ""}
                      disabled
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold">Email</label>
                    <input
                      type="text"
                      className="form-control"
                      value={user?.email || ""}
                      disabled
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold">Họ và tên</label>
                    <input
                      type="text"
                      className="form-control"
                      value={user?.full_name || ""}
                      disabled
                    />
                  </div>
                  <div className="mb-4">
                    <label className="form-label fw-bold">Số điện thoại</label>
                    <input
                      type="text"
                      className="form-control"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Nhập số điện thoại"
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-dark w-100 py-2 fw-bold fs-4"
                  >
                    Cập nhật thông tin
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default Profile;
