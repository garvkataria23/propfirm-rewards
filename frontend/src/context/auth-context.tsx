'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '@/lib/api';
import {
  auth,
  db,
  googleProvider,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  type ConfirmationResult,
  type FirebaseUser,
} from '@/lib/firebase';
import { userDataStore } from '@/lib/userDataStore';

export type UserRole =
  | 'USER'
  | 'ADMIN'
  | 'SUPER_ADMIN'
  | 'SUPPORT_LEAD'
  | 'SUPPORT_AGENT'
  | 'FINANCE_OFFICER';

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  country?: string;
  role: UserRole;
  department?: string;
  status: string;
  avatarUrl?: string;
  authProvider?: string;
  points?: {
    available: number;
    pending: number;
    lifetimeEarned: number;
    lifetimeRedeemed: number;
  };
}

const STAFF_ACCOUNT_DIRECTORY: Record<
  string,
  { name: string; role: UserRole; department: string; country: string; avatarUrl: string }
> = {
  'admin@propfirmrewards.com': {
    name: 'Alexander Sterling',
    role: 'SUPER_ADMIN',
    department: 'EXECUTIVE',
    country: 'United States',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
  },
  'manager@propfirmrewards.com': {
    name: 'Operations Admin',
    role: 'ADMIN',
    department: 'OPERATIONS',
    country: 'United States',
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
  },
  'sarah.support@propfirmrewards.com': {
    name: 'Sarah Chen',
    role: 'SUPPORT_LEAD',
    department: 'VIP_CONCIERGE',
    country: 'United Kingdom',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
  },
  'marcus.support@propfirmrewards.com': {
    name: 'Marcus Vance',
    role: 'SUPPORT_AGENT',
    department: 'VERIFICATION',
    country: 'United States',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
  },
  'elena.finance@propfirmrewards.com': {
    name: 'Elena Rostova',
    role: 'FINANCE_OFFICER',
    department: 'PAYOUTS',
    country: 'Germany',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
  },
};

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<User>;
  loginWithGoogle: (
    googleUser?: { credential?: string; email?: string; name?: string; avatarUrl?: string },
    rememberMe?: boolean
  ) => Promise<User>;
  sendPhoneOtp: (phoneNumber: string, recaptchaContainerId?: string) => Promise<ConfirmationResult>;
  verifyPhoneOtp: (
    confirmationResult: ConfirmationResult,
    otpCode: string,
    extraProfile?: { name?: string; country?: string; email?: string },
    rememberMe?: boolean
  ) => Promise<User>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    country?: string;
  }) => Promise<User>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function syncUserProfileWithFirestore(
  fbUser: FirebaseUser,
  overrides?: {
    name?: string;
    phone?: string;
    country?: string;
    authProvider?: string;
  }
): Promise<User> {
  const email = (fbUser.email || `${fbUser.uid}@phone.propnation.app`).toLowerCase();
  const staffMatch = STAFF_ACCOUNT_DIRECTORY[email];
  const isGenericAdmin = email.includes('admin@');

  let firestoreData: Partial<User> | null = null;
  try {
    const userDocRef = doc(db, 'users', fbUser.uid);
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      firestoreData = snap.data() as Partial<User>;
    }
    await userDataStore.syncFromFirestore(fbUser.uid, firestoreData?.email || email);
  } catch {
    // Firestore may still be provisioning or offline; fallback to local + Firebase Auth profile
  }

  const resolvedEmail = (firestoreData?.email || fbUser.email || email).toLowerCase();
  const realAvailable = userDataStore.calculateAvailablePoints(resolvedEmail);
  const realPending = userDataStore.calculatePendingPoints(resolvedEmail);
  const realEarned = userDataStore.calculateTotalEarnedPoints(resolvedEmail);
  const realRedeemed = userDataStore.calculateTotalRedeemedPoints(resolvedEmail);

  const resolvedRole: UserRole =
    staffMatch?.role ||
    (firestoreData?.role as UserRole) ||
    (isGenericAdmin ? 'ADMIN' : 'USER');

  const resolvedUser: User = {
    id: fbUser.uid,
    email: firestoreData?.email || fbUser.email || email,
    name:
      overrides?.name ||
      staffMatch?.name ||
      firestoreData?.name ||
      fbUser.displayName ||
      (fbUser.phoneNumber ? `Trader ${fbUser.phoneNumber.slice(-4)}` : email.split('@')[0]),
    phone: overrides?.phone || firestoreData?.phone || fbUser.phoneNumber || undefined,
    country: overrides?.country || staffMatch?.country || firestoreData?.country || 'United States',
    role: resolvedRole,
    department: staffMatch?.department || firestoreData?.department || undefined,
    status: firestoreData?.status || 'ACTIVE',
    avatarUrl: staffMatch?.avatarUrl || firestoreData?.avatarUrl || fbUser.photoURL || undefined,
    authProvider:
      overrides?.authProvider ||
      firestoreData?.authProvider ||
      fbUser.providerData?.[0]?.providerId ||
      'firebase',
    points: {
      available: realAvailable,
      pending: realPending,
      lifetimeEarned: realEarned,
      lifetimeRedeemed: realRedeemed,
    },
  };

  // Persist/merge user profile into Cloud Firestore
  try {
    const userDocRef = doc(db, 'users', fbUser.uid);
    await setDoc(
      userDocRef,
      {
        ...resolvedUser,
        uid: fbUser.uid,
        updatedAt: serverTimestamp(),
        ...(firestoreData ? {} : { createdAt: serverTimestamp() }),
      },
      { merge: true }
    );
  } catch {
    // Non-blocking if Firestore rules/API are propagating
  }

  return resolvedUser;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const persistSession = (accessToken: string, userData: User, rememberMe = true) => {
    const userStr = JSON.stringify(userData);
    if (rememberMe) {
      localStorage.setItem('propfirm_token', accessToken);
      localStorage.setItem('propfirm_user', userStr);
      localStorage.setItem('propfirm_remember_login', 'true');
      if (userData.email) {
        localStorage.setItem('propfirm_saved_email', userData.email);
      }
      sessionStorage.removeItem('propfirm_token');
      sessionStorage.removeItem('propfirm_user');
    } else {
      sessionStorage.setItem('propfirm_token', accessToken);
      sessionStorage.setItem('propfirm_user', userStr);
      localStorage.removeItem('propfirm_token');
      localStorage.removeItem('propfirm_user');
      localStorage.removeItem('propfirm_remember_login');
    }
    setToken(accessToken);
    setUser(userData);
  };

  useEffect(() => {
    const savedToken =
      localStorage.getItem('propfirm_token') || sessionStorage.getItem('propfirm_token');
    const savedUser =
      localStorage.getItem('propfirm_user') || sessionStorage.getItem('propfirm_user');

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
        setIsLoading(false);
      } catch {
        // Ignore parse errors
      }
    }

    // Handle Google redirect result if user came back from signInWithRedirect
    getRedirectResult(auth)
      .then(async (result) => {
        if (result?.user) {
          const idToken = await result.user.getIdToken();
          const syncedUser = await syncUserProfileWithFirestore(result.user, {
            authProvider: 'google.com',
          });
          persistSession(idToken, syncedUser, true);
        }
      })
      .catch(() => {});

    // Subscribe to Firebase Auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        try {
          const idToken = await fbUser.getIdToken();
          const syncedUser = await syncUserProfileWithFirestore(fbUser);
          const rememberMe = localStorage.getItem('propfirm_remember_login') !== 'false';
          persistSession(idToken, syncedUser, rememberMe);
        } catch {
          // Keep existing local session if token fetch fails
        }
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const refreshUser = async () => {
    try {
      if (auth.currentUser) {
        const synced = await syncUserProfileWithFirestore(auth.currentUser);
        setUser(synced);
        const userStr = JSON.stringify(synced);
        if (localStorage.getItem('propfirm_token')) {
          localStorage.setItem('propfirm_user', userStr);
        } else if (sessionStorage.getItem('propfirm_token')) {
          sessionStorage.setItem('propfirm_user', userStr);
        }
        return;
      }

      const data = await api.get<User>('/auth/me');
      setUser(data);
    } catch {
      // Do not force logout on background refresh
    }
  };

  const login = async (email: string, password: string, rememberMe = true): Promise<User> => {
    const cleanEmail = email.trim();
    try {
      await setPersistence(
        auth,
        rememberMe ? browserLocalPersistence : browserSessionPersistence
      );

      let userCred;
      try {
        userCred = await signInWithEmailAndPassword(auth, cleanEmail, password);
      } catch (signInErr: any) {
        const lowerEmail = cleanEmail.toLowerCase();
        const staffEntry = STAFF_ACCOUNT_DIRECTORY[lowerEmail];
        const isDemoAccount = lowerEmail === 'trader@example.com' || Boolean(staffEntry);
        if (
          isDemoAccount &&
          (signInErr?.code === 'auth/user-not-found' ||
            signInErr?.code === 'auth/invalid-credential')
        ) {
          userCred = await createUserWithEmailAndPassword(auth, cleanEmail, password);
          await updateProfile(userCred.user, {
            displayName: staffEntry ? staffEntry.name : 'Alex Morgan',
          });
        } else {
          throw signInErr;
        }
      }

      const idToken = await userCred.user.getIdToken();
      const syncedUser = await syncUserProfileWithFirestore(userCred.user, {
        authProvider: 'password',
      });
      persistSession(idToken, syncedUser, rememberMe);
      return syncedUser;
    } catch (firebaseErr: any) {
      // Fallback to existing API if configured
      try {
        const res = await api.post<{ accessToken: string; user: User }>('/auth/login', {
          email: cleanEmail,
          password,
        });
        persistSession(res.accessToken, res.user, rememberMe);
        return res.user;
      } catch {
        const code = firebaseErr?.code || '';
        if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
          throw new Error('Invalid email or password. Please check your credentials or create an account.');
        }
        if (code === 'auth/too-many-requests') {
          throw new Error('Too many failed login attempts. Please wait a moment and try again.');
        }
        throw new Error(firebaseErr?.message || 'Sign in failed. Please verify your credentials.');
      }
    }
  };

  const loginWithGoogle = async (
    googleUser?: { credential?: string; email?: string; name?: string; avatarUrl?: string },
    rememberMe = true
  ): Promise<User> => {
    await setPersistence(
      auth,
      rememberMe ? browserLocalPersistence : browserSessionPersistence
    );

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      const syncedUser = await syncUserProfileWithFirestore(result.user, {
        authProvider: 'google.com',
      });
      persistSession(idToken, syncedUser, rememberMe);
      return syncedUser;
    } catch (popupErr: any) {
      const code = popupErr?.code || '';
      if (code === 'auth/popup-blocked') {
        await signInWithRedirect(auth, googleProvider);
        throw new Error('Redirecting to Google Sign-In...');
      }
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
        throw new Error('Google Sign-In window was closed before completing authentication.');
      }
      if (googleUser?.credential) {
        const res = await api.post<{ accessToken: string; user: User }>('/auth/google', googleUser);
        persistSession(res.accessToken, res.user, rememberMe);
        return res.user;
      }
      throw new Error(popupErr?.message || 'Google Sign-In failed. Please try again.');
    }
  };

  const sendPhoneOtp = async (
    phoneNumber: string,
    recaptchaContainerId = 'recaptcha-container'
  ): Promise<ConfirmationResult> => {
    if (typeof window === 'undefined') {
      throw new Error('Phone authentication requires a browser environment.');
    }

    const formattedPhone = phoneNumber.startsWith('+')
      ? phoneNumber.replace(/\s+/g, '')
      : `+${phoneNumber.replace(/\s+/g, '')}`;

    // Clear existing verifier if re-sending
    const win = window as any;
    if (win.recaptchaVerifier) {
      try {
        win.recaptchaVerifier.clear();
      } catch {
        // Ignore clear errors
      }
      win.recaptchaVerifier = null;
    }

    const container = document.getElementById(recaptchaContainerId);
    if (container) {
      container.innerHTML = '';
    }

    const appVerifier = new RecaptchaVerifier(auth, recaptchaContainerId, {
      size: 'invisible',
    });
    win.recaptchaVerifier = appVerifier;

    try {
      const confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      return confirmationResult;
    } catch (err: any) {
      if (win.recaptchaVerifier) {
        try {
          win.recaptchaVerifier.clear();
        } catch {}
        win.recaptchaVerifier = null;
      }
      throw new Error(
        err?.message || 'Failed to send verification SMS. Check phone number format (e.g. +15550192834).'
      );
    }
  };

  const verifyPhoneOtp = async (
    confirmationResult: ConfirmationResult,
    otpCode: string,
    extraProfile?: { name?: string; country?: string; email?: string },
    rememberMe = true
  ): Promise<User> => {
    try {
      const result = await confirmationResult.confirm(otpCode.trim());
      if (extraProfile?.name) {
        await updateProfile(result.user, { displayName: extraProfile.name }).catch(() => {});
      }
      const idToken = await result.user.getIdToken();
      const syncedUser = await syncUserProfileWithFirestore(result.user, {
        name: extraProfile?.name,
        country: extraProfile?.country,
        phone: result.user.phoneNumber || undefined,
        authProvider: 'phone',
      });
      persistSession(idToken, syncedUser, rememberMe);
      return syncedUser;
    } catch (err: any) {
      const code = err?.code || '';
      if (code === 'auth/invalid-verification-code') {
        throw new Error('Invalid OTP verification code. Please check the 6-digit SMS code.');
      }
      if (code === 'auth/code-expired') {
        throw new Error('Verification code has expired. Please request a new SMS code.');
      }
      throw new Error(err?.message || 'Phone OTP verification failed.');
    }
  };

  const register = async (data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    country?: string;
  }): Promise<User> => {
    const cleanEmail = data.email.trim();
    try {
      await setPersistence(auth, browserLocalPersistence);
      const userCred = await createUserWithEmailAndPassword(auth, cleanEmail, data.password);
      await updateProfile(userCred.user, {
        displayName: data.name.trim(),
      });

      const idToken = await userCred.user.getIdToken();
      const syncedUser = await syncUserProfileWithFirestore(userCred.user, {
        name: data.name.trim(),
        phone: data.phone,
        country: data.country,
        authProvider: 'password',
      });
      persistSession(idToken, syncedUser, true);
      return syncedUser;
    } catch (firebaseErr: any) {
      const code = firebaseErr?.code || '';
      if (code === 'auth/email-already-in-use') {
        throw new Error('An account with this email already exists. Please sign in instead.');
      }
      if (code === 'auth/weak-password') {
        throw new Error('Password should be at least 6 characters long.');
      }
      if (code === 'auth/invalid-email') {
        throw new Error('Please enter a valid email address.');
      }
      throw new Error(firebaseErr?.message || 'Registration failed. Please try again.');
    }
  };

  const logout = () => {
    signOut(auth).catch(() => {});
    localStorage.removeItem('propfirm_token');
    localStorage.removeItem('propfirm_user');
    localStorage.removeItem('propfirm_remember_login');
    sessionStorage.removeItem('propfirm_token');
    sessionStorage.removeItem('propfirm_user');
    setToken(null);
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        loginWithGoogle,
        sendPhoneOtp,
        verifyPhoneOtp,
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
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
