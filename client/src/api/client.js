const API_BASE = import.meta.env.VITE_API_URL || '/api';

function getToken() {
  return localStorage.getItem('token');
}

async function request(endpoint, options = {}) {
  const token = getToken();
  const headers = { ...options.headers };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || 'Request failed');
  }

  return res.json();
}

export const api = {
  // Auth
  register: (data) => request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data) => request('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  getMe: () => request('/auth/me'),
  addRole: (role) => request('/auth/add-role', { method: 'POST', body: JSON.stringify({ role }) }),
  switchMode: (mode) => request('/auth/switch-mode', { method: 'PATCH', body: JSON.stringify({ mode }) }),
  updateProfile: (data) => request('/auth/profile', { method: 'PATCH', body: JSON.stringify(data) }),

  // Categories
  getCategories: () => request('/categories'),
  setPreferences: (categoryIds) => request('/categories/preferences', { method: 'POST', body: JSON.stringify({ categoryIds }) }),
  getPreferences: () => request('/categories/preferences'),

  // Products
  getFeed: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/products/feed?${q}`);
  },
  search: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/products/search?${q}`);
  },
  getProduct: (id) => request(`/products/${id}`),
  likeProduct: (id) => request(`/products/${id}/like`, { method: 'POST' }),
  saveProduct: (id) => request(`/products/${id}/save`, { method: 'POST' }),
  getLiked: () => request('/products/user/liked'),
  getSaved: () => request('/products/user/saved'),
  getRecent: () => request('/products/user/recent'),

  // Shops
  getShop: (id) => request(`/shops/${id}`),
  getSeller: (id) => request(`/shops/seller/${id}`),
  getMyShops: () => request('/shops/my/shops'),
  createShop: (formData) => request('/shops', { method: 'POST', body: formData, headers: {} }),
  updateShop: (id, formData) => request(`/shops/${id}`, { method: 'PATCH', body: formData, headers: {} }),
  setShopLocation: (id, data) => request(`/shops/${id}/location`, { method: 'POST', body: JSON.stringify(data) }),

  // Seller Products
  getMyProducts: () => request('/seller/products/my'),
  createProduct: (formData) => request('/seller/products', { method: 'POST', body: formData, headers: {} }),
  updateProduct: (id, formData) => request(`/seller/products/${id}`, { method: 'PATCH', body: formData, headers: {} }),
  deleteProduct: (id) => request(`/seller/products/${id}`, { method: 'DELETE' }),

  // Messages
  getConversations: () => request('/messages'),
  startConversation: (recipientId) => request('/messages/start', { method: 'POST', body: JSON.stringify({ recipientId }) }),
  getMessages: (id) => request(`/messages/${id}/messages`),
  sendMessage: (id, content) => request(`/messages/${id}/messages`, { method: 'POST', body: JSON.stringify({ content }) }),

  // Admin
  getAdminStats: () => request('/admin/stats'),
  getAdminUsers: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/admin/users?${q}`);
  },
  toggleUserStatus: (id, isActive) => request(`/admin/users/${id}/status`, { method: 'PATCH', body: JSON.stringify({ isActive }) }),
  getAdminProducts: () => request('/admin/products'),
  toggleProductStatus: (id, isActive) => request(`/admin/products/${id}/status`, { method: 'PATCH', body: JSON.stringify({ isActive }) }),
  getAdminCategories: () => request('/admin/categories'),
  createCategory: (data) => request('/admin/categories', { method: 'POST', body: JSON.stringify(data) }),
  getAdminShops: () => request('/admin/shops'),
  toggleShopStatus: (id, isActive) => request(`/admin/shops/${id}/status`, { method: 'PATCH', body: JSON.stringify({ isActive }) }),
};

export function formatPrice(price, currency = 'TSh') {
  if (!price) return null;
  return `${currency} ${Number(price).toLocaleString()}`;
}

export function getImageUrl(url) {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return url;
}

export function getLocationString(location) {
  if (!location) return '';
  const parts = [location.area, location.street, location.building, location.floor && `Floor ${location.floor}`, location.shopNumber && `Shop ${location.shopNumber}`].filter(Boolean);
  return parts.join(', ');
}
