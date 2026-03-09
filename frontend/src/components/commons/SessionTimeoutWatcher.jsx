import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import wishlistService from "../../services/wishlistService";
import {
  getToken,
  getLoginAt,
  setLoginAt,
  clearAuthStorage,
} from "../../services/authStorage";

const SESSION_MS = 30 * 60 * 1000;

const clearAuth = () => {
  clearAuthStorage();

  // Keep auth-aware UI in sync (wishlist badge/state, etc.)
  try {
    wishlistService.notifyAuthChanged();
  } catch {
    // ignore
  }
};

export default function SessionTimeoutWatcher() {
  const navigate = useNavigate();
  const location = useLocation();
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    const token = getToken();
    if (!token) return;

    let loginAt = Number(getLoginAt());
    if (!Number.isFinite(loginAt) || loginAt <= 0) {
      loginAt = Date.now();
      setLoginAt(loginAt);
    }

    const remainingMs = loginAt + SESSION_MS - Date.now();

    const onExpire = () => {
      // Re-check in case user already logged out.
      if (!getToken()) return;

      window.alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      clearAuth();
      navigate("/login", { replace: true });
    };

    if (remainingMs <= 0) {
      onExpire();
      return;
    }

    timeoutRef.current = setTimeout(onExpire, remainingMs);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [navigate, location.pathname]);

  return null;
}
