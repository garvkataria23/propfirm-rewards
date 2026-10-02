'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { ShieldCheck, AlertCircle } from 'lucide-react';

interface GoogleSignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  rememberMe?: boolean;
}



export function GoogleSignInModal({ isOpen, onClose, rememberMe = true }: GoogleSignInModalProps) {
  const router = useRouter();
  const { loginWithGoogle } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const googleBtnRef = useRef<HTMLDivElement>(null);

  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const isDev = process.env.NODE_ENV !== 'production';

  useEffect(() => {
    if (!isOpen) {
      setError(null);
      return;
    }

    // Load Google Identity Services script if not already present
    if (googleClientId && typeof window !== 'undefined') {
      const existingScript = document.getElementById('google-jssdk');
      if (!existingScript) {
        const script = document.createElement('script');
        script.id = 'google-jssdk';
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = initGoogleBtn;
        document.body.appendChild(script);
      } else {
        initGoogleBtn();
      }
    }

    function initGoogleBtn() {
      const g = typeof window !== 'undefined' ? (window as any).google : null;
      if (g?.accounts?.id && googleClientId && googleBtnRef.current) {
        g.accounts.id.initialize({
          client_id: googleClientId,
          callback: async (response: { credential?: string }) => {
            if (!response.credential) {
              setError('Failed to obtain verified Google credential.');
              return;
            }
            setIsSubmitting(true);
            setError(null);
            try {
              const user = await loginWithGoogle({ credential: response.credential }, rememberMe);
              onClose();
              if (['ADMIN', 'SUPER_ADMIN', 'SUPPORT_LEAD', 'SUPPORT_AGENT', 'FINANCE_OFFICER'].includes(user.role)) {
                router.push('/admin');
              } else {
                router.push('/dashboard');
              }
            } catch (err: any) {
              setError(err.message || 'Google verification failed.');
            } finally {
              setIsSubmitting(false);
            }
          },
        });

        g.accounts.id.renderButton(googleBtnRef.current, {
          theme: 'outline',
          size: 'large',
          width: '100%',
          text: 'continue_with',
          shape: 'pill',
        });
      }
    }
  }, [isOpen, googleClientId, loginWithGoogle, rememberMe, onClose, router]);

  // Dev-only mock handler for local tests without live Google credentials
  const handleDevMockLogin = async () => {
    if (!isDev) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const user = await loginWithGoogle({ credential: 'mock_test_token_dev_environment' }, rememberMe);
      onClose();
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Dev mock Google login failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Sign in with Google"
      description="Cryptographically verified Google OAuth 2.0 Single Sign-On."
      maxWidth="md"
    >
      <div className="space-y-4 text-left">
        {/* Security Notice */}
        <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
          <ShieldCheck className="h-5 w-5 text-emerald-500 shrink-0" />
          <div>
            <span className="font-bold text-slate-800 dark:text-slate-200">Cryptographically Verified Identity</span>
            <p className="text-[11px] text-slate-500">
              Identity is derived on our backend directly from Google&apos;s signed JWT token.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Official Google Identity Button Container */}
        <div className="py-2 flex justify-center">
          <div ref={googleBtnRef} className="w-full flex justify-center" />
        </div>

        {/* Notice when Google Client ID is not configured */}
        {!googleClientId && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-700 dark:text-amber-400">
            <strong>Configuration Notice:</strong> NEXT_PUBLIC_GOOGLE_CLIENT_ID is not configured in this environment.
            Please configure Google OAuth credentials in your deployment dashboard.
          </div>
        )}

        {/* Development Mock Option (Strictly non-production only) */}
        {isDev && !googleClientId && (
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-center">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isSubmitting}
              onClick={handleDevMockLogin}
              className="w-full text-xs font-semibold"
            >
              {isSubmitting ? 'Authenticating...' : 'Sign In With Local Dev Mock Identity (Development Only)'}
            </Button>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
}
