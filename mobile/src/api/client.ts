import * as SecureStore from 'expo-secure-store';
import {
    LoginResponse,
    ProfileResponse,
    QuestsResponse,
    SkillsResponse,
    TitlesResponse,
    CompleteQuestResponse,
    Quest,
} from '../types';

// Production API URL (deployed on Render)
const API_BASE_URL = 'https://evolvexsystem-tcz2.onrender.com/api';

const TOKEN_KEY = 'auth_token';

// Token management
export const getToken = async (): Promise<string | null> => {
    try {
        return await SecureStore.getItemAsync(TOKEN_KEY);
    } catch {
        return null;
    }
};

export const setToken = async (token: string): Promise<void> => {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
};

export const removeToken = async (): Promise<void> => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
};

// API request helper
async function apiRequest<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const token = await getToken();

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'Request failed');
    }

    return data;
}

// API endpoints
export const API = {
    // Authentication
    register: (username: string, email: string, password: string) =>
        apiRequest<LoginResponse>('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ username, email, password }),
        }),

    login: (username: string, password: string) =>
        apiRequest<LoginResponse>('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password }),
        }),

    verify: () => apiRequest<{ valid: boolean }>('/auth/verify'),

    // User
    getProfile: () => apiRequest<ProfileResponse>('/user/profile'),

    getTitles: () => apiRequest<TitlesResponse>('/user/titles'),

    restoreStamina: (amount: number = 20) =>
        apiRequest<{ message: string; new_stamina: number }>('/user/restore-stamina', {
            method: 'POST',
            body: JSON.stringify({ amount }),
        }),

    uploadProfileImage: async (uri: string): Promise<{ image_url: string }> => {
        const token = await getToken();
        const formData = new FormData();

        const filename = uri.split('/').pop() || 'profile.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';

        formData.append('image', {
            uri,
            name: filename,
            type,
        } as any);

        const response = await fetch(`${API_BASE_URL}/user/upload-image`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
            },
            body: formData,
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Upload failed');
        return data;
    },

    // Quests
    getAvailableQuests: () => apiRequest<QuestsResponse>('/quests/available'),

    completeQuest: (questId: string) =>
        apiRequest<CompleteQuestResponse>('/quests/complete', {
            method: 'POST',
            body: JSON.stringify({ quest_id: questId }),
        }),

    addQuest: (questData: Partial<Quest>) =>
        apiRequest<{ message: string; quest: Quest }>('/quests/add', {
            method: 'POST',
            body: JSON.stringify(questData),
        }),

    deleteQuest: (questId: string) =>
        apiRequest<{ message: string }>(`/quests/${questId}`, {
            method: 'DELETE',
        }),

    editQuest: (questData: Partial<Quest>) =>
        apiRequest<{ message: string }>('/quests/edit', {
            method: 'PUT',
            body: JSON.stringify(questData),
        }),

    // Skills
    getSkills: () => apiRequest<SkillsResponse>('/skills/'),

    unlockSkill: (skillId: string) =>
        apiRequest<{ message: string }>('/skills/unlock', {
            method: 'POST',
            body: JSON.stringify({ skill_id: skillId }),
        }),
};
