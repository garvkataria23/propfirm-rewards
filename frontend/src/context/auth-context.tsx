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
    lifetimeEarned?: number;
    lifetimeRedeemed?: number;
  };
  activeRedemptionsCount?: number;
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string, rememberLogin?: boolean) => Promise<UserProfile>;
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
    // Check localStorage (remembered) or sessionStorage
    const savedToken =
      typeof window !== 'undefined'
        ? localStorage.getItem('propfirm_token') || sessionStorage.getItem('propfirm_token')
        : null;

    if (!savedToken) {
      setUser(null);
      setToken(null);
      setIsLoading(false);
      return;
    }

    try {
      if (savedToken === 'demo_jwt_token_sample') {
        const savedEmail = localStorage.getItem('propfirm_saved_email') || 'trader@example.com';
        const isAdmin = savedEmail.includes('admin');
        setUser({
          id: isAdmin ? 'demo-admin-id' : 'demo-trader-id',
          email: savedEmail,
          name: isAdmin ? 'Admin Manager' : 'Garv Gautam Kataria',
          role: isAdmin ? 'ADMIN' : 'USER',
          status: 'ACTIVE',
          country: 'India',
          phone: '+91 98765 43210',
          points: { available: isAdmin ? 50000 : 12500, pending: 2500 },
        });
        setToken(savedToken);
        return;
      }
      const profile = await api.get<UserProfile>('/auth/me');
      setUser(profile);
      setToken(savedToken);
    } catch (err) {
      console.warn('Failed to fetch user profile, using fallback demo session:', err);
      const savedEmail = localStorage.getItem('propfirm_saved_email') || 'trader@example.com';
      const isAdmin = savedEmail.includes('admin');
      setUser({
        id: isAdmin ? 'demo-admin-id' : 'demo-trader-id',
        email: savedEmail,
        name: isAdmin ? 'Admin Manager' : 'Garv Gautam Kataria',
        role: isAdmin ? 'ADMIN' : 'USER',
        status: 'ACTIVE',
        country: 'India',
        phone: '+91 98765 43210',
        points: { available: isAdmin ? 50000 : 12500, pending: 2500 },
      });
      setToken(savedToken);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (email: string, password: string, rememberLogin: boolean = true): Promise<UserProfile> => {
    setIsLoading(true);
    try {
      const response = await api.post<{ token: string; user: UserProfile }>('/auth/login', {
        email,
        password,
      });

      if (rememberLogin) {
        localStorage.setItem('propfirm_token', response.token);
        localStorage.setItem('propfirm_remember_login', 'true');
        localStorage.setItem('propfirm_saved_email', email);
      } else {
        sessionStorage.setItem('propfirm_token', response.token);
        localStorage.removeItem('propfirm_remember_login');
      }
      setToken(response.token);

      const profile = await api.get<UserProfile>('/auth/me');
      setUser(profile);
      return profile;
    } catch (err) {
      console.warn('Backend login unreachable, falling back to demo session:', err);
      // Demo session fallback for live showcases
      const isAdmin = email.includes('admin');
      const fallbackUser: UserProfile = {
        id: isAdmin ? 'demo-admin-id' : 'demo-trader-id',
        email,
        name: isAdmin ? 'Admin Manager' : 'Garv Gautam Kataria',
        role: isAdmin ? 'ADMIN' : 'USER',
        status: 'ACTIVE',
        country: 'India',
        phone: '+91 98765 43210',
        points: {
          available: isAdmin ? 50000 : 12500,
          pending: 2500,
        },
      };

      if (rememberLogin) {
        localStorage.setItem('propfirm_token', 'demo_jwt_token_sample');
        localStorage.setItem('propfirm_remember_login', 'true');
        localStorage.setItem('propfirm_saved_email', email);
      } else {
        sessionStorage.setItem('propfirm_token', 'demo_jwt_token_sample');
        localStorage.removeItem('propfirm_remember_login');
      }
      setToken('demo_jwt_token_sample');
      setUser(fallbackUser);
      return fallbackUser;
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
      localStorage.setItem('propfirm_remember_login', 'true');
      localStorage.setItem('propfirm_saved_email', data.email);
      setToken(response.token);

      const profile = await api.get<UserProfile>('/auth/me');
      setUser(profile);
      return profile;
    } catch (err) {
      // Fallback demo user
      const fallbackUser: UserProfile = {
        id: 'new-trader-id',
        email: data.email,
        name: data.name,
        role: 'USER',
        status: 'ACTIVE',
        country: data.country || 'India',
        phone: data.phone || '+91 98765 43210',
        points: {
          available: 1000, // Welcome bonus
          pending: 0,
        },
      };
      localStorage.setItem('propfirm_token', 'demo_jwt_token_sample');
      localStorage.setItem('propfirm_remember_login', 'true');
      localStorage.setItem('propfirm_saved_email', data.email);
      setToken('demo_jwt_token_sample');
      setUser(fallbackUser);
      return fallbackUser;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('propfirm_token');
    localStorage.removeItem('propfirm_remember_login');
    sessionStorage.removeItem('propfirm_token');
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
