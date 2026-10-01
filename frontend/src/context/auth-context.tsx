'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN';
  status: 'ACTIVE' | 'SUSPENDED' | 'PENDING';
  phone?: string;
  country?: string;
  avatarUrl?: string;
  points?: {
    available: number;
    pending: number;
  };
  activeRedemptionsCount?: number;
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<UserProfile>;
  register: (data: { email: string; password: string; name: string; phone?: string; country?: string }) => Promise<UserProfile>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const savedToken = localStorage.getItem('propfirm_token');
    if (!savedToken) {
      setUser(null);
      setToken(null);
      setIsLoading(false);
      return;
    }

    try {
      const profile = await api.get<UserProfile>('/auth/me');
      setUser(profile);
      setToken(savedToken);
    } catch (err) {
      console.error('Failed to fetch user profile, clearing session', err);
      localStorage.removeItem('propfirm_token');
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (email: string, password: string): Promise<UserProfile> => {
    setIsLoading(true);
    try {
      const response = await api.post<{ token: string; user: UserProfile }>('/auth/login', {
        email,
        password,
      });

      localStorage.setItem('propfirm_token', response.token);
      setToken(response.token);

      // Fetch full profile with points details
      const profile = await api.get<UserProfile>('/auth/me');
      setUser(profile);
      return profile;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: {
    email: string;
    password: string;
    name: string;
    phone?: string;
    country?: string;
  }): Promise<UserProfile> => {
    setIsLoading(true);
    try {
      const response = await api.post<{ token: string; user: UserProfile }>('/auth/register', data);
      localStorage.setItem('propfirm_token', response.token);
      setToken(response.token);

      const profile = await api.get<UserProfile>('/auth/me');
      setUser(profile);
      return profile;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('propfirm_token');
    setUser(null);
    setToken(null);
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
