import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../assets/css/auth.css";
import bg from "../../assets/imgs/bg.jpg";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  const OTP_TTL_MS = 10 * 60 * 1000;
  const [otpExpiresAt, setOtpExpiresAt] = useState(null);
  const [remainingMs, setRemainingMs] = useState(OTP_TTL_MS);

  const isOtpExpired = useMemo(() => {
    return step === 2 && remainingMs <= 0;
  }, [step, remainingMs]);

  const formatRemaining = (ms) => {
    const clamped = Math.max(0, ms);
    const totalSeconds = Math.floor(clamped / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const mm = String(minutes).padStart(2, "0");
    const ss = String(seconds).padStart(2, "0");
    return `${mm}:${ss}`;
  };

  useEffect(() => {
    if (step !== 2 || !otpExpiresAt) return;

    const tick = () => {
      const next = Math.max(0, otpExpiresAt - Date.now());
      setRemainingMs(next);
      if (next <= 0) {
        setError("Mã xác nhận đã hết hạn. Vui lòng gửi lại mã mới.");
        setMessage("");
        setStep(1);
        setOtpExpiresAt(null);
      }
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [step, otpExpiresAt]);

  const handleSendCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const res = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.code === "200") {
        setMessage("Mã xác nhận đã được gửi! Vui lòng kiểm tra email.");
        setStep(2);
        setOtpExpiresAt(Date.now() + OTP_TTL_MS);
        setRemainingMs(OTP_TTL_MS);
      } else {
        setError(data.message || "Có lỗi xảy ra.");
      }
    } catch (err) {
      setError("Lỗi kết nối máy chủ.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (isOtpExpired) {
      setError("Mã xác nhận đã hết hạn. Vui lòng gửi lại mã mới.");
      return;
    }
    setPasswordError("");
    setConfirmPasswordError("");
    if (newPassword.length < 8) {
      setPasswordError("Mật khẩu phải có ít nhất 8 ký tự");
      return;
    }
    if (newPassword !== confirmPassword) {
      setConfirmPasswordError("Mật khẩu xác nhận không khớp");
      return;
    }
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const res = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          code,
          new_password: newPassword,
          confirm_password: confirmPassword,
        }),
      });
      const data = await res.json();
      if (data.code === "200") {
        setMessage("Đặt lại mật khẩu thành công! Đang chuyển hướng...");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setError(data.message || "Đặt lại mật khẩu thất bại.");
      }
    } catch (err) {
      setError("Lỗi kết nối máy chủ.");
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <form className="auth-form" onSubmit={handleSendCode}>
      <div className="form-group">
        <label className="form-label" htmlFor="email">
          Email đăng ký
        </label>
        <input
          type="email"
          id="email"
          className="form-input"
          placeholder="nhapemailcuaban@example.com"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <button type="submit" className="auth-button" disabled={loading}>
        {loading ? "Đang gửi..." : "Gửi mã xác nhận"}
      </button>
    </form>
  );

  const renderStep2 = () => (
    <form className="auth-form" onSubmit={handleResetPassword}>
      <div className="form-group">
        <label className="form-label" htmlFor="code">
          Mã xác nhận (OTP)
          {otpExpiresAt && (
            <span style={{ marginLeft: 10, fontSize: 13, color: "#555" }}>
              Còn lại: {formatRemaining(remainingMs)}
            </span>
          )}
        </label>
        <input
          type="text"
          id="code"
          className="form-input"
          placeholder="Nhập mã 6 số"
          required
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="newPassword">
          Mật khẩu mới
        </label>
        <div className="password-input-wrapper">
          <input
            type={showPassword ? "text" : "password"}
            id="newPassword"
            className="form-input"
            style={{ width: "100%" }}
            placeholder="••••••••"
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <button
            type="button"
            className="password-toggle-icon"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? "👁️" : "👁️‍🗨️"}
          </button>
        </div>
        {passwordError && (
          <div style={{ color: "red", fontSize: 14, marginTop: 4 }}>
            {passwordError}
          </div>
        )}
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="confirmPassword">
          Xác nhận mật khẩu
        </label>
        <div className="password-input-wrapper">
          <input
            type={showConfirmPassword ? "text" : "password"}
            id="confirmPassword"
            className="form-input"
            placeholder="••••••••"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <button
            type="button"
            className="password-toggle-icon"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
          </button>
        </div>
        {confirmPasswordError && (
          <div style={{ color: "red", fontSize: 14, marginTop: 4 }}>
            {confirmPasswordError}
          </div>
        )}
      </div>

      <button
        type="submit"
        className="auth-button"
        disabled={loading || isOtpExpired}
      >
        {loading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
      </button>
    </form>
  );

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
          <h2 className="auth-title">Quên mật khẩu</h2>
          <p className="auth-subtitle">
            {step === 1
              ? "Nhập email để nhận mã xác thực"
              : "Nhập mã xác thực và mật khẩu mới"}
          </p>
        </div>

        {message && (
          <div
            style={{ color: "green", marginBottom: 12, textAlign: "center" }}
          >
            {message}
          </div>
        )}
        {error && (
          <div style={{ color: "red", marginBottom: 12, textAlign: "center" }}>
            {error}
          </div>
        )}

        {step === 1 ? renderStep1() : renderStep2()}

        <div className="auth-footer">
          <Link to="/login" className="auth-link">
            Quay lại đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
