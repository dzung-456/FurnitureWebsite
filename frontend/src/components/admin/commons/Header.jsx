import logo from "../../../assets/imgs/logo.svg";
import { PiBellSimpleRingingFill } from "react-icons/pi";
import { IoSettings } from "react-icons/io5";
import { useEffect, useMemo, useState } from "react";
import userService from "../../../services/userService";
import {
  getStoredUser,
  getToken,
  setAuth,
} from "../../../services/authStorage";
import "./header.css";

const toTitleCase = (value) => {
  if (!value || typeof value !== "string") return "";
  return value
    .replace(/[_-]+/g, " ")
    .trim()
    .split(/\s+/)
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : ""))
    .join(" ");
};

const getInitials = (name) => {
  if (!name || typeof name !== "string") return "U";
  const cleaned = name.trim();
  if (!cleaned || cleaned === "—") return "U";
  const parts = cleaned.split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] || "";
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] || "" : "";
  const initials = (first + last).toUpperCase();
  return initials || "U";
};

const resolveAvatarSrc = (value) => {
  if (!value) return null;
  if (typeof value !== "string") return null;
  const v = value.trim();
  if (!v) return null;

  // Absolute / external URLs (GitHub/Google/Facebook) or data URIs.
  if (/^(https?:)?\/\//i.test(v) || /^data:/i.test(v)) return v;

  // Already a rooted path.
  if (v.startsWith("/")) return v;

  // Common stored relative paths.
  if (v.startsWith("uploads/")) return `/${v}`;

  // Default: avatar filename stored by backend upload flow.
  return `/uploads/avatars/${v}`;
};

const Header = () => {
  const [user, setUser] = useState(() => getStoredUser());
  const [loadingUser, setLoadingUser] = useState(false);

  const refreshUser = async () => {
    // Quick local fallback first so UI isn't blank.
    setUser(getStoredUser());

    const token = getToken();
    if (!token) return;

    setLoadingUser(true);
    try {
      const current = await userService.getCurrentUser();
      setUser(current);
      // Keep storage in sync (so other screens can reuse it).
      setAuth({ user: current });
    } catch {
      // Ignore: keep local snapshot if API fails.
    } finally {
      setLoadingUser(false);
    }
  };

  useEffect(() => {
    refreshUser();

    const onAuthChanged = () => refreshUser();
    window.addEventListener("auth:changed", onAuthChanged);
    return () => window.removeEventListener("auth:changed", onAuthChanged);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const displayName = useMemo(() => {
    if (user?.full_name) return user.full_name;
    if (user?.username) return user.username;
    return loadingUser ? "Loading…" : "—";
  }, [loadingUser, user]);

  const displayRole = useMemo(() => {
    if (!user?.role) return "—";
    return toTitleCase(user.role);
  }, [user]);

  const initials = useMemo(() => getInitials(displayName), [displayName]);
  const avatarSrc = useMemo(() => resolveAvatarSrc(user?.avatar), [user]);

  return (
    <header className="admin-header">
      {/* Logo Section */}
      <div className="header-logo-section">
        <img src={logo} alt="logo" className="header-logo" />
        <h1 className="header-title">Admin Dashboard</h1>
      </div>

      {/* Actions Section */}
      <div className="header-actions">
        {/* Notifications */}
        <button className="header-icon-btn">
          <PiBellSimpleRingingFill />
          <span className="notification-badge">3</span>
        </button>

        {/* Settings */}
        <button className="header-icon-btn">
          <IoSettings />
        </button>

        {/* Divider */}
        <div className="header-divider"></div>

        {/* Profile */}
        <div className="header-profile">
          <div className="header-avatar">
            {avatarSrc ? (
              <img
                src={avatarSrc}
                alt="Avatar"
                className="header-avatar-img"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  // If external image fails, fall back to initials.
                  e.currentTarget.style.display = "none";
                }}
              />
            ) : (
              initials
            )}
          </div>
          <div className="header-profile-info">
            <p className="header-profile-name">{displayName}</p>
            <p className="header-profile-role">{displayRole}</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
