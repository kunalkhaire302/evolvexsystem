/**
 * API Utility Functions
 * Centralized API communication with JWT authentication
 */

const API_BASE_URL = '/api';

/**
 * Get JWT token from localStorage
 */
function getToken() {
    return localStorage.getItem('token');
}

/**
 * Set JWT token in localStorage
 */
function setToken(token) {
    localStorage.setItem('token', token);
}

/**
 * Remove JWT token from localStorage
 */
function removeToken() {
    localStorage.removeItem('token');
}

/**
 * Make authenticated API request
 */
async function apiRequest(endpoint, options = {}) {
    const token = getToken();

    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Request failed');
        }

        return data;
    } catch (error) {
        console.error('API Request Error:', error);
        throw error;
    }
}

/**
 * API Endpoints
 */
const API = {
    // Authentication
    register: (username, email, password) =>
        apiRequest('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ username, email, password })
        }),

    login: (username, password) =>
        apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        }),

    verify: () =>
        apiRequest('/auth/verify'),

    // User
    getProfile: () =>
        apiRequest('/user/profile'),

    getTitles: () =>
        apiRequest('/user/titles'),

    restoreStamina: (amount = 20) =>
        apiRequest('/user/restore-stamina', {
            method: 'POST',
            body: JSON.stringify({ amount })
        }),

    uploadProfileImage: async (formData) => {
        const token = getToken();
        const response = await fetch(`${API_BASE_URL}/user/upload-image`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Upload failed');
        return data;
    },

    // Quests
    getAvailableQuests: () =>
        apiRequest('/quests/available'),

    completeQuest: (questId) =>
        apiRequest('/quests/complete', {
            method: 'POST',
            body: JSON.stringify({ quest_id: questId })
        }),

    getQuestHistory: () =>
        apiRequest('/quests/history'),

    addQuest: (questData) =>
        apiRequest('/quests/add', {
            method: 'POST',
            body: JSON.stringify(questData)
        }),

    deleteQuest: (questId) =>
        apiRequest(`/quests/${questId}`, {
            method: 'DELETE'
        }),

    editQuest: (questData) =>
        apiRequest('/quests/edit', {
            method: 'PUT',
            body: JSON.stringify(questData)
        }),

    // Skills
    getSkills: () =>
        apiRequest('/skills/'),

    unlockSkill: (skillId) =>
        apiRequest('/skills/unlock', {
            method: 'POST',
            body: JSON.stringify({ skill_id: skillId })
        }),

    levelUpSkill: (skillId) =>
        apiRequest('/skills/levelup', {
            method: 'POST',
            body: JSON.stringify({ skill_id: skillId })
        }),

    useSkill: (skillId) =>
        apiRequest('/skills/use', {
            method: 'POST',
            body: JSON.stringify({ skill_id: skillId })
        }),

    // Progress
    getProgressHistory: (limit = 20) =>
        apiRequest(`/progress/history?limit=${limit}`)
};
