const USER_STORAGE_KEY = "user";
const TOKEN_STORAGE_KEY = "token";
const LOGIN_AT_STORAGE_KEY = "loginAt";

export const sanitizeUserForStorage = (user) => {
  if (!user || typeof user !== "object") return null;
  const id = user.id ?? user.user_id ?? null;
  const username = user.username ?? null;
  const role = user.role ?? null;
  const full_name = user.full_name ?? user.fullname ?? null;
  const avatar = user.avatar ?? null;

  const sanitized = { id, username, role, full_name, avatar };
  // Remove undefined so storage is cleaner.
  Object.keys(sanitized).forEach((k) => {
    if (sanitized[k] === undefined) delete sanitized[k];
  });
  return sanitized;
};

const safeJsonParse = (raw) => {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const migrateLegacyAuthIfNeeded = () => {
  // Legacy: user object may contain token + lots of fields.
  // New: store token separately, store a minimized user object.
  let token = "";
  try {
    token = localStorage.getItem(TOKEN_STORAGE_KEY) || "";
  } catch {
    token = "";
  }

  let rawUser = null;
  try {
    rawUser = localStorage.getItem(USER_STORAGE_KEY);
  } catch {
    rawUser = null;
  }

  if (!rawUser) return;

  const parsed = safeJsonParse(rawUser);
  if (!parsed || typeof parsed !== "object") return;

  // Move token out of user if present.
  const legacyToken = typeof parsed.token === "string" ? parsed.token : "";
  if (!token && legacyToken) {
    try {
      localStorage.setItem(TOKEN_STORAGE_KEY, legacyToken);
      token = legacyToken;
    } catch {
      // ignore
    }
  }

  // Move loginAt out of user if present.
  const legacyLoginAt = Number(parsed.loginAt);
  if (Number.isFinite(legacyLoginAt) && legacyLoginAt > 0) {
    try {
      const existing = localStorage.getItem(LOGIN_AT_STORAGE_KEY);
      if (!existing) {
        localStorage.setItem(LOGIN_AT_STORAGE_KEY, String(legacyLoginAt));
      }
    } catch {
      // ignore
    }
  }

  // Rewrite user to sanitized shape.
  const sanitized = sanitizeUserForStorage(parsed);
  try {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(sanitized || {}));
  } catch {
    // ignore
  }

  // Remove legacy redundant keys if present (not used in src).
  try {
    localStorage.removeItem("userId");
    localStorage.removeItem("username");
  } catch {
    // ignore
  }
};

export const getToken = () => {
  migrateLegacyAuthIfNeeded();
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY) || "";
  } catch {
    return "";
  }
};

export const getLoginAt = () => {
  migrateLegacyAuthIfNeeded();
  try {
    const raw = localStorage.getItem(LOGIN_AT_STORAGE_KEY);
    const n = Number(raw);
    return Number.isFinite(n) && n > 0 ? n : null;
  } catch {
    return null;
  }
};

export const setLoginAt = (loginAt) => {
  const n = Number(loginAt);
  if (!Number.isFinite(n) || n <= 0) return;
  try {
    localStorage.setItem(LOGIN_AT_STORAGE_KEY, String(n));
  } catch {
    // ignore
  }
};

export const getStoredUser = () => {
  migrateLegacyAuthIfNeeded();
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    if (!raw) return null;
    const parsed = safeJsonParse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    return sanitizeUserForStorage(parsed);
  } catch {
    return null;
  }
};

export const setAuth = ({ token, user, loginAt } = {}) => {
  if (typeof token === "string" && token) {
    try {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } catch {
      // ignore
    }
  }

  if (loginAt !== undefined && loginAt !== null) {
    setLoginAt(loginAt);
  }

  if (user !== undefined) {
    const sanitized = sanitizeUserForStorage(user);
    try {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(sanitized || {}));
    } catch {
      // ignore
    }
  }
};

export const clearAuthStorage = () => {
  try {
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(LOGIN_AT_STORAGE_KEY);
  } catch {
    // ignore
  }

  // Clean legacy redundant keys.
  try {
    localStorage.removeItem("userId");
    localStorage.removeItem("username");
  } catch {
    // ignore
  }
};

export const getAuthSnapshot = () => {
  const token = getToken();
  const user = getStoredUser();
  const loginAt = getLoginAt();
  return { token, user, loginAt };
};

export const isAuthenticated = () => !!getToken();
