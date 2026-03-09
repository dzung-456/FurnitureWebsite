import React, { useState } from "react";
import { Link } from "react-router-dom";
import SocialLoginRegister from "./socialLoginRegister";
import "../../assets/css/auth.css";
import { useNavigate } from "react-router-dom";
import bg from "../../assets/imgs/bg.jpg";

const Register = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [form, setForm] = useState({
    username: "",
    password: "",
    email: "",
    full_name: "",
    confirm_password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  const handleLoginClick = (e) => {
    e.preventDefault();
    navigate("/login");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const updated = { ...prev, [name]: value };
      // Kiểm tra xác nhận mật khẩu realtime
      if (
        name === "confirm_password" ||
        (name === "password" && prev.confirm_password)
      ) {
        if (name === "confirm_password" && value !== prev.password) {
          setConfirmPasswordError("Mật khẩu xác nhận không khớp");
        } else if (
          name === "password" &&
          prev.confirm_password &&
          value !== prev.confirm_password
        ) {
          setConfirmPasswordError("Mật khẩu xác nhận không khớp");
        } else {
          setConfirmPasswordError("");
        }
      }
      return updated;
    });
    if (name === "password" && passwordError) {
      if (value.length >= 8) setPasswordError("");
    }
    if (name === "username") {
      if (!/^[a-zA-Z0-9_]+$/.test(value)) {
        setUsernameError(
          "Tên đăng nhập không được chứa ký tự đặc biệt, chỉ cho phép chữ cái, số và dấu gạch dưới"
        );
      } else {
        setUsernameError("");
      }
    }
    if (name === "email") {
      if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)) {
        setEmailError("Email không đúng định dạng");
      } else {
        setEmailError("");
      }
    }
  };

  const handlePasswordBlur = () => {
    if (form.password.length < 8) {
      setPasswordError("Mật khẩu phải có ít nhất 8 ký tự");
    } else {
      setPasswordError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password.length < 8) {
      setPasswordError("Mật khẩu phải có ít nhất 8 ký tự");
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(form.username)) {
      setUsernameError(
        "Tên đăng nhập không được chứa ký tự đặc biệt, chỉ cho phép chữ cái, số và dấu gạch dưới"
      );
      return;
    }
    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(form.email)) {
      setEmailError("Email không đúng định dạng");
      return;
    }
    if (form.password !== form.confirm_password) {
      setConfirmPasswordError("Mật khẩu xác nhận không khớp");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.username,
          password: form.password,
          email: form.email,
          full_name: form.full_name,
        }),
      });
      const data = await res.json();
      if (data.code === "201") {
        navigate("/login");
      } else {
        setError(data.message || "Đăng ký thất bại");
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
      <div className="auth-card" style={{ maxWidth: "500px" }}>
        <div>
          <h2 className="auth-title">Tạo tài khoản</h2>
          <p className="auth-subtitle">
            Tham gia cùng chúng tôi để khám phá các bộ sưu tập nội thất độc
            quyền
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="full_name">
              Họ và tên
            </label>
            <input
              type="text"
              id="full_name"
              name="full_name"
              className="form-input"
              placeholder="Ex: Nguyen Van A"
              required
              value={form.full_name}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="username">
              Tên đăng nhập
            </label>
            <input
              type="text"
              id="username"
              name="username"
              className="form-input"
              placeholder="Nhập tên đăng nhập"
              required
              value={form.username}
              onChange={handleChange}
            />
            {usernameError && (
              <div style={{ color: "red", fontSize: 14, marginTop: 4 }}>
                {usernameError}
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-input"
              placeholder="name@example.com"
              required
              value={form.email}
              onChange={handleChange}
            />
            {emailError && (
              <div style={{ color: "red", fontSize: 14, marginTop: 4 }}>
                {emailError}
              </div>
            )}
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
                placeholder="Tạo mật khẩu mạnh"
                required
                value={form.password}
                onChange={handleChange}
                onBlur={handlePasswordBlur}
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
            {passwordError && (
              <div style={{ color: "red", fontSize: 14, marginTop: 4 }}>
                {passwordError}
              </div>
            )}
            <div className="form-group">
              <label className="form-label" htmlFor="confirm_password">
                Xác nhận mật khẩu
              </label>
              <div className="password-input-wrapper">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirm_password"
                  name="confirm_password"
                  className="form-input"
                  style={{ width: "100%" }}
                  placeholder="Nhập lại mật khẩu của bạn"
                  required
                  value={form.confirm_password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="password-toggle-icon"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label="Toggle confirm password visibility"
                >
                  {showConfirmPassword ? (
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
              {confirmPasswordError && (
                <div style={{ color: "red", fontSize: 14, marginTop: 4 }}>
                  {confirmPasswordError}
                </div>
              )}
            </div>
          </div>

          {error && (
            <div
              className="auth-error"
              style={{ color: "red", marginBottom: 8 }}
            >
              {error}
            </div>
          )}
          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? "Đang đăng ký..." : "Tạo tài khoản"}
          </button>
        </form>

        <div className="divider">Hoặc đăng ký với</div>

        <SocialLoginRegister />

        <div className="auth-footer">
          Bạn đã có tài khoản?
          <Link to="/login" className="auth-link" onClick={handleLoginClick}>
            Đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
