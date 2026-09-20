/**
 * Authentication against the SpendSense Cognito user pool (Amplify v6).
 *
 * When VITE_COGNITO_* is unset the module falls back to a local demo session so
 * the app still runs on mock data. Everything above this file — hooks, pages,
 * the HTTP client — is unaware of which path is active.
 */
import {
  confirmResetPassword as amplifyConfirmResetPassword,
  confirmSignUp as amplifyConfirmSignUp,
  fetchAuthSession,
  fetchUserAttributes,
  getCurrentUser as amplifyGetCurrentUser,
  resendSignUpCode,
  resetPassword as amplifyResetPassword,
  signIn as amplifySignIn,
  signOut as amplifySignOut,
  signUp as amplifySignUp,
  updateUserAttributes,
  type FetchUserAttributesOutput,
} from 'aws-amplify/auth';
import type { AuthUser } from '@/types';
import { ApiError } from './errors';
import { isCognitoConfigured } from './config';

export interface Credentials {
  email: string;
  password: string;
}

export interface SignUpInput extends Credentials {
  firstName: string;
  lastName: string;
}

export interface SignUpResult {
  /** True when Cognito emailed a verification code and is waiting for it. */
  needsConfirmation: boolean;
}

const useCognito = (): boolean => isCognitoConfigured();

/* ------------------------------------------------------------------ *
 * Cognito error mapping — never surface raw exception names to people.
 * ------------------------------------------------------------------ */

const ERROR_COPY: Record<string, { message: string; status: number }> = {
  NotAuthorizedException: { message: 'That email and password do not match an account.', status: 401 },
  UserNotFoundException: { message: 'That email and password do not match an account.', status: 401 },
  UserNotConfirmedException: { message: 'Confirm your email address to finish signing up.', status: 403 },
  UsernameExistsException: { message: 'An account already exists with that email.', status: 409 },
  CodeMismatchException: { message: 'That code is not right. Check the email and try again.', status: 400 },
  ExpiredCodeException: { message: 'That code has expired. Request a new one.', status: 400 },
  LimitExceededException: { message: 'Too many attempts. Wait a few minutes and try again.', status: 429 },
  TooManyRequestsException: { message: 'Too many attempts. Wait a few minutes and try again.', status: 429 },
  InvalidPasswordException: {
    message: 'Use at least 8 characters with a lowercase letter and a number.',
    status: 400,
  },
  InvalidParameterException: { message: 'Check the details you entered and try again.', status: 400 },
  PasswordResetRequiredException: { message: 'Reset your password to continue.', status: 403 },
};

function toApiError(cause: unknown): ApiError {
  const name = cause instanceof Error ? cause.name : '';
  const copy = ERROR_COPY[name];
  if (copy) return new ApiError(name, copy.message, copy.status);
  return new ApiError('AUTH_ERROR', 'Could not complete that. Try again in a moment.', 500);
}

function mapUser(userId: string, attributes: FetchUserAttributesOutput): AuthUser {
  return {
    userId,
    email: attributes.email ?? '',
    firstName: attributes.given_name ?? attributes.email?.split('@')[0] ?? 'There',
    lastName: attributes.family_name ?? '',
    location: attributes['custom:location'],
    plan: 'FREE',
    emailVerified: attributes.email_verified === 'true',
  };
}

/* ------------------------------------------------------------------ *
 * Demo fallback (no Cognito configured)
 * ------------------------------------------------------------------ */

const SESSION_KEY = 'spendsense.session.v1';

interface StoredSession {
  user: AuthUser;
  idToken: string;
  expiresAt: number;
}

const DEMO_USER: AuthUser = {
  userId: 'demo-user-spendsense',
  email: 'marcus.lee@example.com',
  firstName: 'Marcus',
  lastName: 'Lee',
  location: 'Bengaluru, IN',
  plan: 'PREMIUM',
  emailVerified: true,
};

function readSession(): StoredSession | null {
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as StoredSession;
    return session.expiresAt < Date.now() ? null : session;
  } catch {
    return null;
  }
}

function writeSession(user: AuthUser): void {
  window.localStorage.setItem(
    SESSION_KEY,
    JSON.stringify({
      user,
      idToken: `demo.${btoa(user.userId)}.token`,
      expiresAt: Date.now() + 1000 * 60 * 60 * 12,
    } satisfies StoredSession),
  );
}

const delay = (ms = 600): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

/* ------------------------------------------------------------------ *
 * Public API
 * ------------------------------------------------------------------ */

/** Resolves the signed-in user, or null. Safe to call on every page load. */
export async function getCurrentUser(): Promise<AuthUser | null> {
  if (!useCognito()) return readSession()?.user ?? null;

  try {
    const { userId } = await amplifyGetCurrentUser();
    return mapUser(userId, await fetchUserAttributes());
  } catch {
    return null;
  }
}

/**
 * The ID token for `Authorization: Bearer …`. API Gateway's Cognito authorizer
 * validates this and Lambda reads `sub` from it — the client never sends userId.
 * Amplify refreshes the token automatically when it is close to expiry.
 */
export async function getIdToken(): Promise<string | null> {
  if (!useCognito()) return readSession()?.idToken ?? null;

  try {
    const session = await fetchAuthSession();
    return session.tokens?.idToken?.toString() ?? null;
  } catch {
    return null;
  }
}

export async function login({ email, password }: Credentials): Promise<AuthUser> {
  if (!useCognito()) {
    await delay();
    if (password.length < 6) {
      throw new ApiError('UNAUTHORIZED', 'That email and password do not match an account.', 401);
    }
    const [name] = email.split('@');
    const [first = 'Marcus', last = 'Lee'] = name.split(/[._-]/);
    const user: AuthUser = {
      ...DEMO_USER,
      email,
      firstName: first.charAt(0).toUpperCase() + first.slice(1),
      lastName: last.charAt(0).toUpperCase() + last.slice(1),
    };
    writeSession(user);
    return user;
  }

  try {
    const { isSignedIn, nextStep } = await amplifySignIn({
      username: email,
      password,
      options: { authFlowType: 'USER_SRP_AUTH' },
    });

    if (!isSignedIn) {
      if (nextStep.signInStep === 'CONFIRM_SIGN_UP') {
        throw new ApiError('CONFIRM_SIGN_UP', 'Confirm your email address to finish signing up.', 403);
      }
      throw new ApiError('AUTH_CHALLENGE', 'Extra verification is needed to sign in.', 401);
    }
  } catch (cause) {
    if (cause instanceof ApiError) throw cause;
    // Signing in while a stale session exists — clear it and retry once.
    if (cause instanceof Error && cause.name === 'UserAlreadyAuthenticatedException') {
      await amplifySignOut();
      return login({ email, password });
    }
    throw toApiError(cause);
  }

  const user = await getCurrentUser();
  if (!user) throw new ApiError('AUTH_ERROR', 'Signed in, but the profile could not be loaded.', 500);
  return user;
}

export async function signUp({ email, password, firstName, lastName }: SignUpInput): Promise<SignUpResult> {
  if (!useCognito()) {
    await delay(800);
    writeSession({ ...DEMO_USER, email, firstName, lastName, plan: 'FREE' });
    return { needsConfirmation: false };
  }

  try {
    const { nextStep } = await amplifySignUp({
      username: email,
      password,
      options: {
        userAttributes: { email, given_name: firstName, family_name: lastName },
      },
    });
    return { needsConfirmation: nextStep.signUpStep === 'CONFIRM_SIGN_UP' };
  } catch (cause) {
    throw toApiError(cause);
  }
}

/** Confirms the emailed code, then signs the new account in. */
export async function confirmSignUp(email: string, code: string, password?: string): Promise<AuthUser | null> {
  if (!useCognito()) return readSession()?.user ?? null;

  try {
    await amplifyConfirmSignUp({ username: email, confirmationCode: code.trim() });
  } catch (cause) {
    throw toApiError(cause);
  }

  return password ? login({ email, password }) : null;
}

export async function resendConfirmationCode(email: string): Promise<void> {
  if (!useCognito()) return;
  try {
    await resendSignUpCode({ username: email });
  } catch (cause) {
    throw toApiError(cause);
  }
}

export async function requestPasswordReset(email: string): Promise<void> {
  if (!useCognito()) {
    await delay(700);
    return;
  }
  try {
    await amplifyResetPassword({ username: email });
  } catch (cause) {
    throw toApiError(cause);
  }
}

export async function confirmPasswordReset(
  email: string,
  code: string,
  newPassword: string,
): Promise<void> {
  if (!useCognito()) {
    await delay(700);
    return;
  }
  try {
    await amplifyConfirmResetPassword({
      username: email,
      confirmationCode: code.trim(),
      newPassword,
    });
  } catch (cause) {
    throw toApiError(cause);
  }
}

export async function logout(): Promise<void> {
  if (!useCognito()) {
    await delay(200);
    window.localStorage.removeItem(SESSION_KEY);
    return;
  }
  await amplifySignOut();
}

export async function updateProfile(patch: Partial<AuthUser>): Promise<AuthUser> {
  if (!useCognito()) {
    await delay(500);
    const session = readSession();
    if (!session) throw new ApiError('UNAUTHORIZED', 'Sign in again to update your profile.', 401);
    const user = { ...session.user, ...patch };
    writeSession(user);
    return user;
  }

  try {
    await updateUserAttributes({
      userAttributes: {
        ...(patch.firstName ? { given_name: patch.firstName } : {}),
        ...(patch.lastName ? { family_name: patch.lastName } : {}),
        ...(patch.email ? { email: patch.email } : {}),
      },
    });
  } catch (cause) {
    throw toApiError(cause);
  }

  const user = await getCurrentUser();
  if (!user) throw new ApiError('AUTH_ERROR', 'Profile updated, but it could not be reloaded.', 500);
  return user;
}
