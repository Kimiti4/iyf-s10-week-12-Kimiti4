/**
 * 🔹 Jamii Link KE - API Client
 * Uses relative paths since frontend is served from same domain
 */

const API_CONFIG = {
    BASE_URL: '/api',
    TIMEOUT: 10000,
    DEMO_TOKEN: 'jamii-link-ke-2026'
};

// Store auth token in localStorage if available
let authToken = localStorage.getItem('auth_token') || API_CONFIG.DEMO_TOKEN;

// Helper: Build query string
function buildQuery(params) {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            qs.append(key, value);
        }
    });
    return qs.toString();
}

// Helper: Handle response
async function handleResponse(response) {
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error?.message || 'API Error');
    }
    return data;
}

// Generic fetch wrapper
async function apiRequest(endpoint, options = {}) {
    const url = `${API_CONFIG.BASE_URL}${endpoint}`;
    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...(authToken && { 'Authorization': `Bearer ${authToken}` })
        },
        ...options
    };

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);
    config.signal = controller.signal;

    try {
        const response = await fetch(url, config);
        clearTimeout(timeout);
        return await handleResponse(response);
    } catch (error) {
        clearTimeout(timeout);
        if (error.name === 'AbortError') {
            throw new Error('Request timeout');
        }
        throw error;
    }
}

// Export API modules
const postsAPI = {
    getAll: (filters = {}) => apiRequest(`/posts?${buildQuery(filters)}`),
    getById: (id) => apiRequest(`/posts/${id}`),
    create: (data) => apiRequest('/posts', {
        method: 'POST',
        body: JSON.stringify(data)
    }),
    update: (id, data) => apiRequest(`/posts/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    }),
    delete: (id) => apiRequest(`/posts/${id}`, { method: 'DELETE' }),
    engage: (id, type = 'like') => apiRequest(`/posts/${id}/engage?type=${type}`),
    getComments: (postId) => apiRequest(`/posts/${postId}/comments`),
    addComment: (postId, content, author) => apiRequest(`/posts/${postId}/comments`, {
        method: 'POST',
        body: JSON.stringify({ content, author })
    }),
    deleteComment: (postId, commentId) => apiRequest(`/posts/${postId}/comments/${commentId}`, {
        method: 'DELETE'
    })
};

const marketAPI = {
    getPrices: (filters = {}) => apiRequest(`/market/prices?${buildQuery(filters)}`)
};

const locationsAPI = {
    getAll: (filters = {}) => apiRequest(`/locations?${buildQuery(filters)}`)
};

const healthAPI = {
    check: () => apiRequest('/health')
};

// Export for use in other modules
window.JamiiAPI = {
    posts: postsAPI,
    market: marketAPI,
    locations: locationsAPI,
    health: healthAPI,
    setAuthToken: (token) => {
        authToken = token;
        localStorage.setItem('auth_token', token);
    }
};
