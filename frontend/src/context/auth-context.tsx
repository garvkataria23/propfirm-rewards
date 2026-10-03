'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN' | 'SUPPORT_LEAD' | 'SUPPORT_AGENT' | 'FINANCE_OFFICER';
  status: 'ACTIVE' | 'SUSPENDED' | 'PENDING';
  phone?: string;
  country?: string;
  avatarUrl?: string;
  department?: string;
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
    googleData: { credential?: string; idToken?: string; email?: string; name?: string; avatarUrl?: string },
    rememberLogin?: boolean
  ) => Promise<UserProfile>;
  register: (data: { email: string; password: string; name: string; phone?: string; country?: string }) => Promise<UserProfile>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const CACHED_USER_KEY = 'propfirm_cached_user_v1';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedToken = localStorage.getItem('propfirm_token') || sessionStorage.getItem('propfirm_token');
        const cachedUserRaw = localStorage.getItem(CACHED_USER_KEY);
        if (savedToken && cachedUserRaw) {
          const parsed = JSON.parse(cachedUserRaw);
          if (parsed && parsed.id) return parsed;
        }
      } catch {
        // Ignore parse error
      }
    }
    return null;
  });

  const [token, setToken] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('propfirm_token') || sessionStorage.getItem('propfirm_token');
    }
    return null;
  });

  const [isLoading, setIsLoading] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const savedToken = localStorage.getItem('propfirm_token') || sessionStorage.getItem('propfirm_token');
      if (!savedToken) return false;
      const cachedUserRaw = localStorage.getItem(CACHED_USER_KEY);
      if (cachedUserRaw) return false; // Instant 0ms hydration when cached user is present
    }
    return true;
  });

  const persistUser = useCallback((profile: UserProfile | null) => {
    setUser(profile);
    if (typeof window !== 'undefined') {
      try {
        if (profile) {
          localStorage.setItem(CACHED_USER_KEY, JSON.stringify(profile));
        } else {
          localStorage.removeItem(CACHED_USER_KEY);
        }
      } catch {
        // Ignore
      }
    }
  }, []);

  const clearAuthSession = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('propfirm_token');
      localStorage.removeItem('propfirm_remember_login');
      localStorage.removeItem(CACHED_USER_KEY);
      sessionStorage.removeItem('propfirm_token');
    }
    setUser(null);
    setToken(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const savedToken =
      typeof window !== 'undefined'
        ? localStorage.getItem('propfirm_token') || sessionStorage.getItem('propfirm_token')
        : null;

    if (!savedToken) {
      clearAuthSession();
      setIsLoading(false);
      return;
    }

    // Reject known legacy demo or sample tokens immediately
    if (savedToken.includes('demo_jwt_token') || savedToken.includes('google_auth_token_sample')) {
      clearAuthSession();
      setIsLoading(false);
      return;
    }

    try {
      const profile = await api.get<UserProfile>('/auth/me');
      if (profile && profile.id) {
        persistUser(profile);
        setToken(savedToken);
      } else {
        clearAuthSession();
      }
    } catch (err: any) {
      // Only clear session if backend explicitly returned 401 Unauthorized
      if (err?.status === 401) {
        clearAuthSession();
      }
    } finally {
      setIsLoading(false);
    }
  }, [clearAuthSession, persistUser]);

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

      if (!response?.token) {
        throw new Error('Authentication failed: No token received from server');
      }

      if (rememberLogin) {
        localStorage.setItem('propfirm_token', response.token);
        localStorage.setItem('propfirm_remember_login', 'true');
        localStorage.setItem('propfirm_saved_email', cleanEmail);
      } else {
        sessionStorage.setItem('propfirm_token', response.token);
        localStorage.removeItem('propfirm_remember_login');
      }
      setToken(response.token);

      // Immediately hydrate user from login response for 0ms redirect, and refresh full profile in background
      if (response.user && response.user.id) {
        persistUser(response.user);
        api
          .get<UserProfile>('/auth/me', undefined, { bypassCache: true })
          .then((fullProfile) => {
            if (fullProfile && fullProfile.id) persistUser(fullProfile);
          })
          .catch(() => {});
        return response.user;
      }

      const profile = await api.get<UserProfile>('/auth/me', undefined, { bypassCache: true });
      persistUser(profile);
      return profile;
    } catch (err: any) {
      clearAuthSession();
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Authentication failed. Please verify your credentials.';
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async (
    googleData: { credential?: string; idToken?: string; email?: string; name?: string; avatarUrl?: string },
    rememberLogin: boolean = true
  ): Promise<UserProfile> => {
    setIsLoading(true);

    try {
      // Pass the cryptographic credential token to backend
      const payload = {
        credential: googleData.credential || googleData.idToken,
        idToken: googleData.idToken || googleData.credential,
        email: googleData.email,
        name: googleData.name,
        avatarUrl: googleData.avatarUrl,
      };

      const response = await api.post<{ token: string; user: UserProfile }>('/auth/google', payload);

      if (!response?.token) {
        throw new Error('Google authentication failed: No session token received');
      }

      if (rememberLogin) {
        localStorage.setItem('propfirm_token', response.token);
        localStorage.setItem('propfirm_remember_login', 'true');
        if (response.user?.email) {
          localStorage.setItem('propfirm_saved_email', response.user.email);
        }
      } else {
        sessionStorage.setItem('propfirm_token', response.token);
        localStorage.removeItem('propfirm_remember_login');
      }
      setToken(response.token);

      if (response.user && response.user.id) {
        persistUser(response.user);
        api
          .get<UserProfile>('/auth/me', undefined, { bypassCache: true })
          .then((fullProfile) => {
            if (fullProfile && fullProfile.id) persistUser(fullProfile);
          })
          .catch(() => {});
        return response.user;
      }

      const profile = await api.get<UserProfile>('/auth/me', undefined, { bypassCache: true });
      persistUser(profile);
      return profile;
    } catch (err: any) {
      clearAuthSession();
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Google authentication failed. Please try again.';
      throw new Error(message);
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
      const response = await api.post<{ token: string; user: UserProfile }>('/auth/register', {
        ...data,
        email: cleanEmail,
      });

      if (!response?.token) {
        throw new Error('Registration failed: No session token returned');
      }

      localStorage.setItem('propfirm_token', response.token);
      localStorage.setItem('propfirm_remember_login', 'true');
      localStorage.setItem('propfirm_saved_email', cleanEmail);
      setToken(response.token);

      if (response.user && response.user.id) {
        persistUser(response.user);
        api
          .get<UserProfile>('/auth/me', undefined, { bypassCache: true })
          .then((fullProfile) => {
            if (fullProfile && fullProfile.id) persistUser(fullProfile);
          })
          .catch(() => {});
        return response.user;
      }

      const profile = await api.get<UserProfile>('/auth/me', undefined, { bypassCache: true });
      persistUser(profile);
      return profile;
    } catch (err: any) {
      clearAuthSession();
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Registration failed. Please check your details.';
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    api.clearCache();
    clearAuthSession();
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
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
