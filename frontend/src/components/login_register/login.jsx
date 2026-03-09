import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import SocialLoginRegister from "./socialLoginRegister";
import "../../assets/css/auth.css";
import { useNavigate } from "react-router-dom";
import bg from "../../assets/imgs/bg.jpg";
import wishlistService from "../../services/wishlistService";
import { setAuth } from "../../services/authStorage";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const redirectAfterLogin = (user) => {
    if (user?.role === "admin") {
      navigate("/admin");
      return;
    }
    navigate("/");
  };

  const storeUserAndRedirect = async ({ token, username }) => {
    // Prefer authoritative user info from /api/me so we can route by role.
    try {
      const res = await fetch("/api/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data?.code === "200" && data?.data) {
        const loginAt = Date.now();
        const userForState = {
          ...data.data,
          username: data.data.username || username,
          token,
          loginAt,
        };
        setAuth({ token, user: userForState, loginAt });

        // Refresh any auth-aware UI (wishlist badge/state, etc.)
        wishlistService.notifyAuthChanged();
        try {
          await wishlistService.syncWishlistIdsFromApi();
        } catch {
          // ignore
        }

        redirectAfterLogin(userForState);
        return;
      }
    } catch {
      // ignore and fall back
    }

    // Fallback if /api/me fails
    const loginAt = Date.now();
    setAuth({ token, user: { username }, loginAt });
    wishlistService.notifyAuthChanged();
    redirectAfterLogin({ role: undefined });
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    if (token) {
      storeUserAndRedirect({ token, username: "" }).catch(() => {
        setError("Lỗi kết nối máy chủ");
      });
    }
  }, [location]);

  const handleRegisterClick = (e) => {
    e.preventDefault();
    navigate("/register");
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.username,
          password: form.password,
        }),
      });
      const data = await res.json();
      if (data.code === "200" && data.data && data.data.access_token) {
        await storeUserAndRedirect({
          token: data.data.access_token,
          username: form.username,
        });
      } else {
        setError(data.message || "Đăng nhập thất bại");
      }
    } catch (err) {
      setError("Lỗi kết nối máy chủ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="auth-container"
      style={{
        backgroundImage: `url(${bg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div className="auth-card">
        <div>
          <h2 className="auth-title">Chào mừng trở lại</h2>
          <p className="auth-subtitle">
            Vui lòng nhập thông tin của bạn để đăng nhập
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="username">
              Tên đăng nhập
            </label>
            <input
              type="text"
              id="username"
              name="username"
              className="form-input"
              placeholder="Enter your username"
              required
              value={form.username}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Mật khẩu
            </label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                className="form-input"
                style={{ width: "100%" }}
                placeholder="••••••••"
                required
                value={form.password}
                onChange={handleChange}
              />
              <button
                type="button"
                className="password-toggle-icon"
                onClick={() => setShowPassword(!showPassword)}
                aria-label="Toggle password visibility"
              >
                {showPassword ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                )}
              </button>
            </div>
          </div>
          {error && (
            <div style={{ color: "red", marginBottom: 8 }}>{error}</div>
          )}

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "0.9rem",
            }}
          >
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                cursor: "pointer",
                color: "#666",
                fontSize: "15px",
              }}
            >
              <input type="checkbox" style={{ accentColor: "#646cff" }} /> Ghi
              nhớ đăng nhập
            </label>
            <Link
              to="/forgot-password"
              style={{
                color: "#646cff",
                textDecoration: "none",
                fontWeight: "500",
                fontSize: "15px",
              }}
            >
              Quên mật khẩu?
            </Link>
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>

        <div className="divider">Hoặc tiếp tục với</div>
        <SocialLoginRegister />

        <div className="auth-footer">
          Bạn chưa có tài khoản?
          <Link
            to="/register"
            className="auth-link"
            onClick={handleRegisterClick}
          >
            Đăng ký
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
