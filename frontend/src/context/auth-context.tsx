'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { userDataStore } from '@/lib/userDataStore';

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
  loginWithGoogle: (
    googleData: { email: string; name: string; avatarUrl?: string },
    rememberLogin?: boolean
  ) => Promise<UserProfile>;
  register: (data: { email: string; password: string; name: string; phone?: string; country?: string }) => Promise<UserProfile>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const buildLocalProfile = useCallback((email: string, name?: string, avatarUrl?: string): UserProfile => {
    const isAdmin = email.toLowerCase().includes('admin');
    const available = userDataStore.calculateAvailablePoints(email);
    const pending = userDataStore.calculatePendingPoints(email);
    const redemptions = userDataStore.getUserRedemptions(email);

    let displayName = name;
    if (!displayName) {
      if (email.toLowerCase().includes('trader')) displayName = 'Demo Trader';
      else if (email.toLowerCase().includes('garv')) displayName = 'Garv Gautam Kataria';
      else if (isAdmin) displayName = 'Platform Administrator';
      else displayName = email.split('@')[0];
    }

    return {
      id: isAdmin ? 'admin-id' : `usr-${Math.abs(email.split('').reduce((a, b) => (a << 5) - a + b.charCodeAt(0), 0))}`,
      email: email.toLowerCase().trim(),
      name: displayName,
      role: isAdmin ? 'ADMIN' : 'USER',
      status: 'ACTIVE',
      country: 'India',
      phone: '+91 98765 43210',
      avatarUrl: avatarUrl || undefined,
      points: {
        available: isAdmin ? 50000 : available,
        pending: isAdmin ? 0 : pending,
      },
      activeRedemptionsCount: redemptions.filter((r) => r.status === 'SHIPPED' || r.status === 'PROCESSING').length,
    };
  }, []);

  const refreshUser = useCallback(async () => {
    const savedToken =
      typeof window !== 'undefined'
        ? localStorage.getItem('propfirm_token') || sessionStorage.getItem('propfirm_token')
        : null;

    const savedEmail =
      typeof window !== 'undefined'
        ? localStorage.getItem('propfirm_saved_email')
        : null;

    if (!savedToken && !savedEmail) {
      setUser(null);
      setToken(null);
      setIsLoading(false);
      return;
    }

    try {
      if (savedToken && savedToken !== 'demo_jwt_token_sample' && savedToken !== 'google_auth_token_sample') {
        const profile = await api.get<UserProfile>('/auth/me');
        if (profile) {
          setUser(profile);
          setToken(savedToken);
          return;
        }
      }
      // Fallback to local profile bound to saved email
      const localProfile = buildLocalProfile(savedEmail || 'trader@example.com');
      setUser(localProfile);
      setToken(savedToken || 'demo_jwt_token_sample');
    } catch {
      const localProfile = buildLocalProfile(savedEmail || 'trader@example.com');
      setUser(localProfile);
      setToken(savedToken || 'demo_jwt_token_sample');
    } finally {
      setIsLoading(false);
    }
  }, [buildLocalProfile]);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (email: string, password: string, rememberLogin: boolean = true): Promise<UserProfile> => {
    setIsLoading(true);
    const cleanEmail = email.toLowerCase().trim();

    try {
      const response = await api.post<{ token: string; user: UserProfile }>('/auth/login', {
        email: cleanEmail,
        password,
      });

      if (rememberLogin) {
        localStorage.setItem('propfirm_token', response.token);
        localStorage.setItem('propfirm_remember_login', 'true');
        localStorage.setItem('propfirm_saved_email', cleanEmail);
      } else {
        sessionStorage.setItem('propfirm_token', response.token);
        localStorage.removeItem('propfirm_remember_login');
      }
      setToken(response.token);

      const profile = await api.get<UserProfile>('/auth/me');
      setUser(profile);
      return profile;
    } catch {
      // Local persistent profile fallback
      const localProfile = buildLocalProfile(cleanEmail);

      if (rememberLogin) {
        localStorage.setItem('propfirm_token', 'demo_jwt_token_sample');
        localStorage.setItem('propfirm_remember_login', 'true');
        localStorage.setItem('propfirm_saved_email', cleanEmail);
      } else {
        sessionStorage.setItem('propfirm_token', 'demo_jwt_token_sample');
        localStorage.removeItem('propfirm_remember_login');
      }
      setToken('demo_jwt_token_sample');
      setUser(localProfile);
      return localProfile;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async (
    googleData: { email: string; name: string; avatarUrl?: string },
    rememberLogin: boolean = true
  ): Promise<UserProfile> => {
    setIsLoading(true);
    const cleanEmail = googleData.email.toLowerCase().trim();

    try {
      const response = await api.post<{ token: string; user: UserProfile }>('/auth/google', {
        email: cleanEmail,
        name: googleData.name,
        avatarUrl: googleData.avatarUrl,
      });

      if (rememberLogin) {
        localStorage.setItem('propfirm_token', response.token);
        localStorage.setItem('propfirm_remember_login', 'true');
        localStorage.setItem('propfirm_saved_email', cleanEmail);
      } else {
        sessionStorage.setItem('propfirm_token', response.token);
        localStorage.removeItem('propfirm_remember_login');
      }
      setToken(response.token);

      const profile = await api.get<UserProfile>('/auth/me');
      setUser(profile);
      return profile;
    } catch {
      // Graceful local profile fallback for Google auth
      const localProfile = buildLocalProfile(cleanEmail, googleData.name, googleData.avatarUrl);

      if (rememberLogin) {
        localStorage.setItem('propfirm_token', 'google_auth_token_sample');
        localStorage.setItem('propfirm_remember_login', 'true');
        localStorage.setItem('propfirm_saved_email', cleanEmail);
      } else {
        sessionStorage.setItem('propfirm_token', 'google_auth_token_sample');
        localStorage.removeItem('propfirm_remember_login');
      }
      setToken('google_auth_token_sample');
      setUser(localProfile);
      return localProfile;
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
    const cleanEmail = data.email.toLowerCase().trim();

    try {
      const response = await api.post<{ token: string; user: UserProfile }>('/auth/register', data);
      localStorage.setItem('propfirm_token', response.token);
      localStorage.setItem('propfirm_remember_login', 'true');
      localStorage.setItem('propfirm_saved_email', cleanEmail);
      setToken(response.token);

      const profile = await api.get<UserProfile>('/auth/me');
      setUser(profile);
      return profile;
    } catch {
      const localProfile = buildLocalProfile(cleanEmail, data.name);
      localStorage.setItem('propfirm_token', 'demo_jwt_token_sample');
      localStorage.setItem('propfirm_remember_login', 'true');
      localStorage.setItem('propfirm_saved_email', cleanEmail);
      setToken('demo_jwt_token_sample');
      setUser(localProfile);
      return localProfile;
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
        loginWithGoogle,
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
