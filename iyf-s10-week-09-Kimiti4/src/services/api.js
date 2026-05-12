/**
 * 🔹 JamiiLink API Service
 * Connects React frontend to Express backend API
 * Handles authentication, posts, comments, and user profiles
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Helper for auth headers
const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

// Generic request function with error handling
const request = async (endpoint, options = {}) => {
    const url = `${API_URL}${endpoint}`;
    
    const config = {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
            ...options.headers
        }
    };
    
    try {
        const response = await fetch(url, config);
        
        // Handle 401 (unauthorized) - redirect to login
        if (response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
            throw new Error('Session expired. Please login again.');
        }
        
        // Handle 403 (forbidden)
        if (response.status === 403) {
            throw new Error('You do not have permission to perform this action.');
        }
        
        // Handle 404 (not found)
        if (response.status === 404) {
            throw new Error('Resource not found.');
        }
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || data.message || 'Request failed');
        }
        
        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
};

// ===== AUTHENTICATION API =====
export const authAPI = {
    /**
     * Register a new user
     * @param {Object} userData - { username, email, password, profile }
     */
    register: (userData) => request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData)
    }),
    
    /**
     * Login user
     * @param {Object} credentials - { email, password }
     */
    login: (credentials) => request('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials)
    }),
    
    /**
     * Get current user profile
     */
    getMe: () => request('/auth/me'),
    
    /**
     * Update user profile
     * @param {Object} profileData - { bio, location, skills, avatar }
     */
    updateProfile: (profileData) => request('/auth/me', {
        method: 'PUT',
        body: JSON.stringify(profileData)
    }),
    
    /**
     * Change password
     * @param {Object} passwordData - { currentPassword, newPassword }
     */
    changePassword: (passwordData) => request('/auth/change-password', {
        method: 'PUT',
        body: JSON.stringify(passwordData)
    })
};

// ===== POSTS API =====
export const postsAPI = {
    /**
     * Get all posts with filtering and search
     * @param {Object} params - { category, search, county, page, limit, sort }
     */
    getAll: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return request(`/posts${query ? `?${query}` : ''}`);
    },
    
    /**
     * Get single post by ID
     * @param {string} id - Post ID
     */
    getById: (id) => request(`/posts/${id}`),
    
    /**
     * Create a new post
     * @param {Object} postData - { title, content, category, location, tags, image }
     */
    create: (postData) => request('/posts', {
        method: 'POST',
        body: JSON.stringify(postData)
    }),
    
    /**
     * Update existing post
     * @param {string} id - Post ID
     * @param {Object} postData - Updated post data
     */
    update: (id, postData) => request(`/posts/${id}`, {
        method: 'PUT',
        body: JSON.stringify(postData)
    }),
    
    /**
     * Delete a post
     * @param {string} id - Post ID
     */
    delete: (id) => request(`/posts/${id}`, {
        method: 'DELETE'
    }),
    
    /**
     * Like/upvote a post
     * @param {string} id - Post ID
     * @param {string} type - 'like' or 'upvote'
     */
    engage: (id, type = 'like') => request(`/posts/${id}/engage?type=${type}`, {
        method: 'PATCH'
    }),
    
    /**
     * Get posts by author
     * @param {string} authorId - Author ID
     */
    getByAuthor: (authorId) => request(`/posts?author=${authorId}`),
    
    /**
     * Search posts
     * @param {string} query - Search term
     * @param {Object} filters - Additional filters
     */
    search: (query, filters = {}) => {
        const params = { search: query, ...filters };
        const queryString = new URLSearchParams(params).toString();
        return request(`/posts/search?${queryString}`);
    },
    
    /**
     * Upload image for a post
     * @param {string} postId - Post ID
     * @param {File} imageFile - Image file to upload
     */
    uploadImage: async (postId, imageFile) => {
        const formData = new FormData();
        formData.append('image', imageFile);
        
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/posts/${postId}/image`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`
            },
            body: formData
        });
        
        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Image upload failed');
        }
        
        return response.json();
    }
};

// ===== COMMENTS API =====
export const commentsAPI = {
    /**
     * Get comments for a post
     * @param {string} postId - Post ID
     */
    getByPost: (postId) => request(`/posts/${postId}/comments`),
    
    /**
     * Create a comment
     * @param {string} postId - Post ID
     * @param {Object} commentData - { content, parentComment }
     */
    create: (postId, commentData) => request(`/posts/${postId}/comments`, {
        method: 'POST',
        body: JSON.stringify(commentData)
    }),
    
    /**
     * Delete a comment
     * @param {string} postId - Post ID
     * @param {string} commentId - Comment ID
     */
    delete: (postId, commentId) => request(`/posts/${postId}/comments/${commentId}`, {
        method: 'DELETE'
    }),
    
    /**
     * Like a comment
     * @param {string} commentId - Comment ID
     */
    like: (commentId) => request(`/comments/${commentId}/like`, {
        method: 'PATCH'
    })
};

// ===== ORGANIZATIONS API =====
export const organizationsAPI = {
    /**
     * Get all organizations
     * @param {Object} params - { type, search, page, limit }
     */
    getAll: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return request(`/organizations${query ? `?${query}` : ''}`);
    },
    
    /**
     * Get organization by slug
     * @param {string} slug - Organization slug
     */
    getBySlug: (slug) => request(`/organizations/${slug}`),
    
    /**
     * Get organization by ID
     * @param {string} id - Organization ID
     */
    getById: (id) => request(`/organizations/${id}`),
    
    /**
     * Get current user's organizations
     */
    getMyOrganizations: () => request('/organizations/my'),
    
    /**
     * Create a new organization
     * @param {Object} orgData - { name, slug, type, description, contact }
     */
    create: (orgData) => request('/organizations', {
        method: 'POST',
        body: JSON.stringify(orgData)
    }),
    
    /**
     * Update organization
     * @param {string} id - Organization ID
     * @param {Object} orgData - Updated organization data
     */
    update: (id, orgData) => request(`/organizations/${id}`, {
        method: 'PUT',
        body: JSON.stringify(orgData)
    }),
    
    /**
     * Delete organization
     * @param {string} id - Organization ID
     */
    delete: (id) => request(`/organizations/${id}`, {
        method: 'DELETE'
    }),
    
    /**
     * Join an organization
     * @param {string} id - Organization ID
     */
    join: (id) => request(`/organizations/${id}/join`, {
        method: 'POST'
    }),
    
    /**
     * Leave an organization
     * @param {string} id - Organization ID
     */
    leave: (id) => request(`/organizations/${id}/leave`, {
        method: 'POST'
    }),
    
    /**
     * Get organization members
     * @param {string} id - Organization ID
     */
    getMembers: (id) => request(`/organizations/${id}/members`),
    
    /**
     * Get organization analytics
     * @param {string} id - Organization ID
     */
    getAnalytics: (id) => request(`/organizations/${id}/analytics`)
};

// ===== USER PROFILES API =====
export const usersAPI = {
    /**
     * Get user profile by ID
     * @param {string} userId - User ID
     */
    getById: (userId) => request(`/users/${userId}`),
    
    /**
     * Get user's posts
     * @param {string} userId - User ID
     */
    getUserPosts: (userId) => request(`/users/${userId}/posts`),
    
    /**
     * Follow a user
     * @param {string} userId - User ID to follow
     */
    follow: (userId) => request(`/users/${userId}/follow`, {
        method: 'POST'
    }),
    
    /**
     * Unfollow a user
     * @param {string} userId - User ID to unfollow
     */
    unfollow: (userId) => request(`/users/${userId}/follow`, {
        method: 'DELETE'
    }),
    
    /**
     * Get verified/badged users
     */
    getVerifiedUsers: () => request('/users/verified')
};

// ===== UTILITY FUNCTIONS =====

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
    return !!localStorage.getItem('token');
};

/**
 * Get current user from localStorage
 */
export const getCurrentUser = () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
};

/**
 * Logout user
 */
export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
};

// Export default object for convenience
export default {
    auth: authAPI,
    posts: postsAPI,
    comments: commentsAPI,
    users: usersAPI,
    organizations: organizationsAPI,
    isAuthenticated,
    getCurrentUser,
    logout
};
