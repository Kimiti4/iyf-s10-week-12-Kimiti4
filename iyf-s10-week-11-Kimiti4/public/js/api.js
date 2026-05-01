/**
 * 🔹 public/js/api.js - Updated for JWT Auth
 */
const API_CONFIG = {
  BASE_URL: '/api',  // Relative path (same server)
  TIMEOUT: 10000
};

// Get auth token from localStorage
function getAuthHeader() {
  const token = localStorage.getItem('jamii_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

// Handle API response
async function handleResponse(response) {
  if (!response.ok) {
    let errorData = { message: `HTTP ${response.status}` };
    try { errorData = await response.json(); } catch {}
    throw new Error(errorData.error?.message || errorData.message || 'API request failed');
  }
  return response.json();
}

// ===== AUTH API =====
const authAPI = {
  async register(userData) {
    const response = await fetch(`${API_CONFIG.BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(userData)
    });
    const result = await handleResponse(response);
    if (result.token) {
      localStorage.setItem('jamii_token', result.token);
      localStorage.setItem('jamii_user', JSON.stringify(result.user));
    }
    return result;
  },
  
  async login(credentials) {
    const response = await fetch(`${API_CONFIG.BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    const result = await handleResponse(response);
    if (result.token) {
      localStorage.setItem('jamii_token', result.token);
      localStorage.setItem('jamii_user', JSON.stringify(result.user));
    }
    return result;
  },
  
  async getMe() {
    const response = await fetch(`${API_CONFIG.BASE_URL}/auth/me`, {
      headers: getAuthHeader()
    });
    return handleResponse(response);
  },
  
  async updateProfile(profileData) {
    const response = await fetch(`${API_CONFIG.BASE_URL}/auth/me`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(profileData)
    });
    return handleResponse(response);
  },
  
  logout() {
    localStorage.removeItem('jamii_token');
    localStorage.removeItem('jamii_user');
  },
  
  getCurrentUser() {
    const userStr = localStorage.getItem('jamii_user');
    return userStr ? JSON.parse(userStr) : null;
  },
  
  isAuthenticated() {
    return !!localStorage.getItem('jamii_token');
  }
};

// ===== POSTS API (with auth) =====
const postsAPI = {
  async getAll(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    const response = await fetch(`${API_CONFIG.BASE_URL}/posts?${params}`, {
      headers: getAuthHeader()
    });
    return handleResponse(response);
  },
  
  async getById(id, includeComments = false) {
    const url = `${API_CONFIG.BASE_URL}/posts/${id}${includeComments ? '?populate=comments' : ''}`;
    const response = await fetch(url, { headers: getAuthHeader() });
    return handleResponse(response);
  },
  
  async create(postData) {
    const response = await fetch(`${API_CONFIG.BASE_URL}/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(postData)
    });
    return handleResponse(response);
  },
  
  async update(id, postData) {
    const response = await fetch(`${API_CONFIG.BASE_URL}/posts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(postData)
    });
    return handleResponse(response);
  },
  
  async delete(id) {
    const response = await fetch(`${API_CONFIG.BASE_URL}/posts/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader()
    });
    return response.ok;
  },
  
  async engage(id, type = 'like') {
    const response = await fetch(`${API_CONFIG.BASE_URL}/posts/${id}/engage?type=${type}`, {
      method: 'PATCH',
      headers: getAuthHeader()
    });
    return handleResponse(response);
  }
};

// ===== COMMENTS API =====
const commentsAPI = {
  async getForPost(postId) {
    const response = await fetch(`${API_CONFIG.BASE_URL}/posts/${postId}/comments`, {
      headers: getAuthHeader()
    });
    return handleResponse(response);
  },
  
  async create(postId, commentData) {
    const response = await fetch(`${API_CONFIG.BASE_URL}/posts/${postId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(commentData)
    });
    return handleResponse(response);
  },
  
  async delete(postId, commentId) {
    const response = await fetch(`${API_CONFIG.BASE_URL}/posts/${postId}/comments/${commentId}`, {
      method: 'DELETE',
      headers: getAuthHeader()
    });
    return response.ok;
  }
};

// ===== MARKET API (unchanged) =====
const marketAPI = {
  async getPrices(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    const response = await fetch(`${API_CONFIG.BASE_URL}/market/prices?${params}`);
    return handleResponse(response);
  }
};

// Health check
async function checkHealth() {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}/health`);
    return response.ok;
  } catch {
    return false;
  }
}

// Export for use in other modules
window.JamiiAPI = {
  auth: authAPI,
  posts: postsAPI,
  comments: commentsAPI,
  market: marketAPI,
  health: { check: checkHealth }
};
