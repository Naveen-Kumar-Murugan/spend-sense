import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { AuthUser } from '@/types';
import * as auth from '@/services/auth';

interface AuthContextValue {
  user: AuthUser | null;
  status: 'loading' | 'authenticated' | 'unauthenticated';
  login: (input: auth.Credentials) => Promise<void>;
  /** Returns whether Cognito is waiting on an emailed verification code. */
  signUp: (input: auth.SignUpInput) => Promise<auth.SignUpResult>;
  confirmSignUp: (email: string, code: string, password?: string) => Promise<void>;
  resendCode: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (patch: Partial<AuthUser>) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthContextValue['status']>('loading');

  useEffect(() => {
    let active = true;
    auth
      .getCurrentUser()
      .then((current) => {
        if (!active) return;
        setUser(current);
        setStatus(current ? 'authenticated' : 'unauthenticated');
      })
      .catch(() => {
        if (active) setStatus('unauthenticated');
      });
    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (input: auth.Credentials) => {
    const next = await auth.login(input);
    setUser(next);
    setStatus('authenticated');
  }, []);

  const signUp = useCallback(async (input: auth.SignUpInput) => {
    const result = await auth.signUp(input);
    if (!result.needsConfirmation) {
      const current = await auth.getCurrentUser();
      setUser(current);
      setStatus(current ? 'authenticated' : 'unauthenticated');
    }
    return result;
  }, []);

  const confirmSignUp = useCallback(async (email: string, code: string, password?: string) => {
    const current = await auth.confirmSignUp(email, code, password);
    if (current) {
      setUser(current);
      setStatus('authenticated');
    }
  }, []);

  const resendCode = useCallback((email: string) => auth.resendConfirmationCode(email), []);

  const logout = useCallback(async () => {
    await auth.logout();
    setUser(null);
    setStatus('unauthenticated');
  }, []);

  const updateProfile = useCallback(async (patch: Partial<AuthUser>) => {
    setUser(await auth.updateProfile(patch));
  }, []);

  const value = useMemo(
    () => ({ user, status, login, signUp, confirmSignUp, resendCode, logout, updateProfile }),
    [user, status, login, signUp, confirmSignUp, resendCode, logout, updateProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>.');
  return context;
}
