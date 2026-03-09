import axiosInstance from "./api";

const WISHLIST_STORAGE_KEY_PREFIX = "wishlist_product_ids";

const getToken = () => {
  try {
    const direct = localStorage.getItem("token");
    if (direct) return direct;
    const raw = localStorage.getItem("user");
    if (!raw) return "";
    const user = JSON.parse(raw);
    return user?.token || "";
  } catch {
    return "";
  }
};

const getCurrentUsername = () => {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return "";
    const user = JSON.parse(raw);
    return user?.username || "";
  } catch {
    return "";
  }
};

const getWishlistStorageKey = () => {
  // Wishlist is tied to authenticated user in this app.
  const token = getToken();
  if (!token) return null;
  const username = getCurrentUsername();
  // Prefer stable username; fall back to a generic per-session key.
  return username
    ? `${WISHLIST_STORAGE_KEY_PREFIX}:${username}`
    : `${WISHLIST_STORAGE_KEY_PREFIX}:current`;
};

const getStoredWishlistIds = () => {
  const key = getWishlistStorageKey();
  if (!key) return [];
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const ids = JSON.parse(raw);
    return Array.isArray(ids) ? ids.map((x) => Number(x)).filter(Boolean) : [];
  } catch {
    return [];
  }
};

const setStoredWishlistIds = (ids) => {
  const key = getWishlistStorageKey();
  if (!key) return [];
  const unique = Array.from(
    new Set((ids || []).map((x) => Number(x)).filter(Boolean))
  );
  localStorage.setItem(key, JSON.stringify(unique));
  if (typeof window !== "undefined" && window?.dispatchEvent) {
    window.dispatchEvent(new Event("wishlist:updated"));
  }
  return unique;
};

const dispatchAuthChanged = () => {
  if (typeof window !== "undefined" && window?.dispatchEvent) {
    window.dispatchEvent(new Event("auth:changed"));
  }
};

const authHeaders = () => {
  const token = getToken();
  if (!token) {
    const err = new Error("NOT_AUTHENTICATED");
    err.code = "NOT_AUTHENTICATED";
    throw err;
  }
  return { Authorization: `Bearer ${token}` };
};

const wishlistService = {
  isAuthenticated: () => !!getToken(),

  isWishlisted: (productId) => {
    if (!getToken()) return false;
    const id = Number(productId);
    if (!id) return false;
    return getStoredWishlistIds().includes(id);
  },

  getWishlistCount: () => {
    if (!getToken()) return 0;
    return getStoredWishlistIds().length;
  },

  markWishlisted: (productId) => {
    if (!getToken()) return;
    const id = Number(productId);
    if (!id) return;
    const ids = getStoredWishlistIds();
    ids.push(id);
    setStoredWishlistIds(ids);
  },

  unmarkWishlisted: (productId) => {
    if (!getToken()) return;
    const id = Number(productId);
    if (!id) return;
    const ids = getStoredWishlistIds().filter((x) => x !== id);
    setStoredWishlistIds(ids);
  },

  clearLocalWishlist: () => {
    // Remove any wishlist keys (legacy + per-user) so state doesn't leak across accounts.
    try {
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(WISHLIST_STORAGE_KEY_PREFIX)) {
          keysToRemove.push(k);
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));
    } catch {
      // ignore
    }

    if (typeof window !== "undefined" && window?.dispatchEvent) {
      window.dispatchEvent(new Event("wishlist:updated"));
    }
  },

  notifyAuthChanged: dispatchAuthChanged,

  syncWishlistIdsFromApi: async () => {
    const response = await axiosInstance.get("/api/wishlist/", {
      headers: authHeaders(),
    });
    const items = response?.data?.data || [];
    const ids = Array.isArray(items)
      ? items.map((x) => Number(x?.product_id)).filter(Boolean)
      : [];
    setStoredWishlistIds(ids);
    return ids;
  },

  addToWishlist: async (productId) => {
    const response = await axiosInstance.post(
      "/api/wishlist/",
      { product_id: Number(productId) },
      { headers: authHeaders() }
    );
    wishlistService.markWishlisted(productId);
    return response.data;
  },

  removeFromWishlistByProductId: async (productId) => {
    const response = await axiosInstance.delete(
      `/api/wishlist/product/${Number(productId)}`,
      { headers: authHeaders() }
    );
    wishlistService.unmarkWishlisted(productId);
    return response.data;
  },

  getWishlist: async () => {
    const response = await axiosInstance.get("/api/wishlist/", {
      headers: authHeaders(),
    });
    const items = response?.data?.data || [];
    if (Array.isArray(items)) {
      setStoredWishlistIds(
        items.map((x) => Number(x?.product_id)).filter(Boolean)
      );
    }
    return response.data;
  },
};

export default wishlistService;
