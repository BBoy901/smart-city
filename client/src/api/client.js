const API_URL = import.meta.env.VITE_API_URL || "/api";

async function request(path, options = {}) {
  const token = localStorage.getItem("token");

  const headers = {
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  // Only set JSON content type when body is not FormData
  if (options.body && !(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(
      data?.message ||
        data?.error ||
        `Request failed with status ${response.status}`,
    );
  }

  return data;
}

const api = {
  // =========================================================
  // AUTH
  // =========================================================

  login: (data) =>
    request("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),

    forgotPassword: (email) =>
  request("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  }),

  register: (data) =>
    request("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  logout: () =>
    request("/auth/logout", {
      method: "POST",
    }),

  resetPassword: (data) =>
    request("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getMe: () => request("/auth/me"),

  addRole: (role) =>
    request("/auth/add-role", {
      method: "POST",
      body: JSON.stringify({ role }),
    }),

  switchMode: (mode) =>
    request("/auth/switch-mode", {
      method: "PATCH",
      body: JSON.stringify({ mode }),
    }),

  updateProfile: (data) =>
    request("/auth/profile", {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  // =========================================================
  // CATEGORIES
  // =========================================================

  getCategories: () => request("/categories"),

  setPreferences: (categoryIds) =>
    request("/categories/preferences", {
      method: "POST",
      body: JSON.stringify({ categoryIds }),
    }),

  getPreferences: () => request("/categories/preferences"),

  // =========================================================
  // PRODUCTS
  // =========================================================

  getFeed: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/products/feed?${q}`);
  },

  search: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/products/search?${q}`);
  },

  getProduct: (id) => request(`/products/${id}`),

  likeProduct: (id) =>
    request(`/products/${id}/like`, {
      method: "POST",
    }),

  saveProduct: (id) =>
    request(`/products/${id}/save`, {
      method: "POST",
    }),

  getLiked: () => request("/products/user/liked"),

  getSaved: () => request("/products/user/saved"),

  getRecent: () => request("/products/user/recent"),

  getRecentSearches: () => request("/products/user/searches"),

  // =========================================================
  // SHOPS
  // =========================================================

  getShop: (id) => request(`/shops/${id}`),

  getSeller: (id) => request(`/shops/seller/${id}`),

  getMyShops: () => request("/shops/my/shops"),

  createShop: (formData) =>
    request("/shops", {
      method: "POST",
      body: formData,
      headers: {},
    }),

  updateShop: (id, formData) =>
    request(`/shops/${id}`, {
      method: "PATCH",
      body: formData,
      headers: {},
    }),

  setShopLocation: (id, data) =>
    request(`/shops/${id}/location`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // =========================================================
  // SELLER PRODUCTS
  // =========================================================

  getMyProducts: () => request("/seller/products/my"),

  createProduct: (formData) =>
    request("/seller/products", {
      method: "POST",
      body: formData,
      headers: {},
    }),

  updateProduct: (id, formData) =>
    request(`/seller/products/${id}`, {
      method: "PATCH",
      body: formData,
      headers: {},
    }),

  deleteProduct: (id) =>
    request(`/seller/products/${id}`, {
      method: "DELETE",
    }),

  deleteProductImage: (productId, imageId) =>
    request(`/seller/products/${productId}/images/${imageId}`, {
      method: "DELETE",
    }),

  // =========================================================
  // MESSAGES
  // =========================================================

  // Get all conversations for the current user
  getConversations: () => request("/messages"),

  // Start or reopen a conversation with another user.
  // productId is optional. When supplied, it becomes the
  // original product context of a newly-created conversation.
  startConversation: (recipientId, productId = null) =>
    request("/messages/start", {
      method: "POST",
      body: JSON.stringify({
        recipientId,
        ...(productId ? { productId } : {}),
      }),
    }),

  // Get all messages inside a conversation
  getMessages: (conversationId) =>
    request(`/messages/${conversationId}/messages`),

  // Get products belonging to the seller in this conversation
  getConversationProducts: (conversationId) =>
    request(`/messages/${conversationId}/products`),

  // Send a normal text message
  sendMessage: (conversationId, content) =>
    request(`/messages/${conversationId}/messages`, {
      method: "POST",
      body: JSON.stringify({
        content,
      }),
    }),

  // Send a photo message
  sendPhoto: (conversationId, file) => {
    const formData = new FormData();

    formData.append("image", file);

    return request(`/messages/${conversationId}/messages/photo`, {
      method: "POST",
      body: formData,
    });
  },

  // Send a product message
  sendProduct: (conversationId, productId) =>
    request(`/messages/${conversationId}/messages/product`, {
      method: "POST",
      body: JSON.stringify({
        productId,
      }),
    }),

  // ---------------------------------------------------------
  // MESSAGE DELETION
  // ---------------------------------------------------------

  // Delete one message only for the current user
  //
  // mode:
  //   "for_me"        -> message disappears only for current user
  //   "for_everyone"  -> message is removed for everyone
  //
  // "for_everyone" is restricted by the backend to the sender.
  deleteMessage: (conversationId, messageId, mode = "for_me") =>
    request(`/messages/${conversationId}/messages/${messageId}`, {
      method: "DELETE",
      body: JSON.stringify({
        mode,
      }),
    }),

  // Delete/hide the entire conversation only for the current user
  deleteConversationForMe: (conversationId) =>
    request(`/messages/${conversationId}`, {
      method: "DELETE",
    }), // =========================================================
  // MESSAGES
  // =========================================================

  // Get all conversations for the current user
  getConversations: () => request("/messages"),

  // Start or reopen a conversation with another user.
  // productId is optional. When supplied, it becomes the
  // original product context of a newly-created conversation.
  startConversation: (recipientId, productId = null) =>
    request("/messages/start", {
      method: "POST",
      body: JSON.stringify({
        recipientId,
        ...(productId ? { productId } : {}),
      }),
    }),

  // Get all messages inside a conversation
  getMessages: (conversationId) =>
    request(`/messages/${conversationId}/messages`),

  // Get products belonging to the seller in this conversation
  getConversationProducts: (conversationId) =>
    request(`/messages/${conversationId}/products`),

  // Send a normal text message
  sendMessage: (conversationId, content) =>
    request(`/messages/${conversationId}/messages`, {
      method: "POST",
      body: JSON.stringify({
        content,
      }),
    }),

  // Send a photo message
  sendPhoto: (conversationId, file) => {
    const formData = new FormData();

    formData.append("image", file);

    return request(`/messages/${conversationId}/messages/photo`, {
      method: "POST",
      body: formData,
    });
  },

  // Send a product message
  sendProduct: (conversationId, productId) =>
    request(`/messages/${conversationId}/messages/product`, {
      method: "POST",
      body: JSON.stringify({
        productId,
      }),
    }),

  // ---------------------------------------------------------
  // MESSAGE DELETION
  // ---------------------------------------------------------

  // Delete one message only for the current user
  //
  // mode:
  //   "for_me"        -> message disappears only for current user
  //   "for_everyone"  -> message is removed for everyone
  //
  // "for_everyone" is restricted by the backend to the sender.
  deleteMessage: (conversationId, messageId, mode = "for_me") =>
    request(`/messages/${conversationId}/messages/${messageId}`, {
      method: "DELETE",
      body: JSON.stringify({
        mode,
      }),
    }),

  // Delete/hide the entire conversation only for the current user
  deleteConversationForMe: (conversationId) =>
    request(`/messages/${conversationId}`, {
      method: "DELETE",
    }),

  // =========================================================
  // ADMIN
  // =========================================================

  getAdminStats: () => request("/admin/stats"),

  getAdminUsers: (params = {}) => {
    const q = new URLSearchParams(params).toString();

    return request(`/admin/users?${q}`);
  },

  toggleUserStatus: (id, isActive) =>
    request(`/admin/users/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({
        isActive,
      }),
    }),

  getAdminProducts: () => request("/admin/products"),

  toggleProductStatus: (id, isActive) =>
    request(`/admin/products/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({
        isActive,
      }),
    }),

  getAdminCategories: () => request("/admin/categories"),

  createCategory: (data) =>
    request("/admin/categories", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getAdminShops: () => request("/admin/shops"),

  toggleShopStatus: (id, isActive) =>
    request(`/admin/shops/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({
        isActive,
      }),
    }),

  // =========================================================
  // SELLER APPROVAL
  // =========================================================

  getPendingSellers: () => request("/admin/sellers/pending"),

  approveSeller: (id, approvalStatus, rejectionReason) =>
    request(`/admin/sellers/${id}/approval`, {
      method: "PATCH",
      body: JSON.stringify({
        approvalStatus,
        rejectionReason,
      }),
    }),
};

export { api };
export default api;

// =============================================================
// HELPERS
// =============================================================

export function formatPrice(price, currency = "TSh") {
  if (!price) return null;

  return `${currency} ${Number(price).toLocaleString()}`;
}

export function getImageUrl(url) {
  if (!url) return null;

  if (url.startsWith("http")) {
    return url;
  }

  const apiUrl = import.meta.env.VITE_API_URL || "";

  if (url.startsWith("/uploads/")) {
    const serverUrl = apiUrl.replace(/\/api\/?$/, "");
    return `${serverUrl}${url}`;
  }

  return `${apiUrl}${url}`;
}

export function getLocationString(location) {
  if (!location) return "";

  const parts = [
    location.area,
    location.street,
    location.building,
    location.floor && `Floor ${location.floor}`,
    location.shopNumber && `Shop ${location.shopNumber}`,
  ].filter(Boolean);

  return parts.join(", ");
}
