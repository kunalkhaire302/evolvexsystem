import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { API, getToken, setToken, removeToken } from '../api/client';
import { User } from '../types';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (username: string, password: string) => Promise<void>;
    register: (username: string, email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const checkAuth = async () => {
        try {
            const token = await getToken();
            if (token) {
                const profile = await API.getProfile();
                setUser(profile);
            }
        } catch (error) {
            await removeToken();
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    const login = async (username: string, password: string) => {
        const response = await API.login(username, password);
        const token = response.token || response.access_token;

        if (token && typeof token === 'string') {
            await setToken(token);
            const profile = await API.getProfile();
            setUser(profile);
        } else {
            console.error('Invalid token received:', response);
            throw new Error('Invalid authentication response');
        }
    };

    const register = async (username: string, email: string, password: string) => {
        const response = await API.register(username, email, password);
        let token = response.token || response.access_token;

        // If registration successful but no token, try auto-login
        if (!token) {
            try {
                const loginRes = await API.login(username, password);
                token = loginRes.token || loginRes.access_token;
            } catch (e) {
                console.error('Auto-login failed after registration:', e);
            }
        }

        if (token && typeof token === 'string') {
            await setToken(token);
            const profile = await API.getProfile();
            setUser(profile);
        } else {
            console.error('Invalid token received:', response);
            // If we have a user object but no token, suggest manual login
            if (response.user) {
                throw new Error('Registration successful. Please login manually.');
            }
            throw new Error('Invalid authentication response');
        }
    };

    const logout = async () => {
        await removeToken();
        setUser(null);
    };

    const refreshProfile = async () => {
        try {
            const profile = await API.getProfile();
            setUser(profile);
        } catch (error) {
            console.error('Failed to refresh profile:', error);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                isAuthenticated: !!user,
                login,
                register,
                logout,
                refreshProfile,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
