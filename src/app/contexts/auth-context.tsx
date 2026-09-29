'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword } from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { toast } from '@merit-incentives/ui';
import { useTranslations } from 'next-intl';

import { auth } from '@/lib/firebase/config';
import { logError } from '@/utils/errorLogger';
import {
  getHttpErrorStatus,
  isTransientNetworkError,
  SESSION_EXPIRED_EVENT,
  SessionExpiredEventDetail,
} from '@/utils/sessionExpiryHandler';
import { UserRole } from '@/types/users';
import {
  setSessionItem,
  getSessionItem,
  removeSessionItem,
  setFirebaseToken,
  removeFirebaseToken,
  clearAllCookies,
} from '@/lib/utils';
import { logOut, validateCookies, validateLogin } from '@/services/authService';
import { setUserLocale } from '@/services/localeService';
import { fetchFullUserProfile } from '@/services/userProfileService';

const USER_STORAGE_KEY = 'authenticatedUser';
const ONBOARDING_COMPLETED_KEY = 'onboardingCompleted';

export interface UserMetaData {
  preferredLanguage?: string;
  profilePicture?: string;
}

interface AuthenticatedUser {
  tenantName: string;
  email: string;
  tenantId: string;
  roleId: string;
  userId: string;
  role: UserRole;
  metadata?: UserMetaData;
}

type AuthState = {
  user: AuthenticatedUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isOnboardingCompleted: boolean;
};

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | {
      type: 'SET_USER_DATA';
      payload: { user: AuthenticatedUser; isOnboardingCompleted: boolean };
    }
  | { type: 'CLEAR_AUTH' }
  | { type: 'SET_ONBOARDING_COMPLETED'; payload: boolean };

interface AuthContextType {
  user: AuthenticatedUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isOnboardingCompleted: boolean;
  hasCompletedOnboarding: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  authenticateAfterSignup: (email: string, password: string) => Promise<void>;
  markOnboardingCompleted: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_USER_DATA':
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        isOnboardingCompleted: action.payload.isOnboardingCompleted,
        isLoading: false,
      };
    case 'CLEAR_AUTH':
      return {
        user: null,
        isAuthenticated: false,
        isOnboardingCompleted: false,
        isLoading: false,
      };
    case 'SET_ONBOARDING_COMPLETED':
      return { ...state, isOnboardingCompleted: action.payload };
    default:
      return state;
  }
};

const initialState: AuthState = {
  user: null,
  isLoading: true,
  isAuthenticated: false,
  isOnboardingCompleted: false,
};

const SESSION_EXPIRY_TOAST_DELAY_MS = 2000;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const t = useTranslations('auth');
  const userRef = useRef(state.user);
  const isHandlingSessionExpiryRef = useRef(false);

  useEffect(() => {
    userRef.current = state.user;
  }, [state.user]);

  const clearAuthState = useCallback(() => {
    dispatch({ type: 'CLEAR_AUTH' });
    removeSessionItem(USER_STORAGE_KEY);
    removeSessionItem(ONBOARDING_COMPLETED_KEY);
    removeFirebaseToken();
    clearAllCookies();
  }, []);

  const handleUnauthorizedAccess = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.location.href = '/unauthorized';
    }
  }, []);

  const redirectToLogin = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }, []);

  const handleSessionExpired = useCallback(
    async (options?: { redirect?: boolean; showToast?: boolean }) => {
      if (isHandlingSessionExpiryRef.current) return;
      isHandlingSessionExpiryRef.current = true;

      let shouldResetExpiryGuard = true;

      try {
        if (options?.showToast) {
          toast.warning(t('sessionExpired.title'), {
            description: t('sessionExpired.description'),
          });
          await new Promise((resolve) =>
            setTimeout(resolve, SESSION_EXPIRY_TOAST_DELAY_MS),
          );
        }

        try {
          await auth.signOut();
        } catch (error) {
          logError('Error signing out on session expiry', error);
        }

        try {
          await logOut();
        } catch (error) {
          logError('Error calling logout API on session expiry', error);
        }

        clearAuthState();

        const shouldRedirect =
          options?.redirect !== false &&
          typeof window !== 'undefined' &&
          !window.location.pathname.startsWith('/login');

        if (shouldRedirect) {
          shouldResetExpiryGuard = false;
          window.location.href = '/login?logout=true';
          return;
        }
      } finally {
        if (shouldResetExpiryGuard) {
          isHandlingSessionExpiryRef.current = false;
        }
      }
    },
    [t, clearAuthState],
  );

  const validateActiveSession = useCallback(async () => {
    if (!auth.currentUser) {
      return;
    }

    try {
      await validateLogin();
    } catch (error) {
      logError('Session validation failed', error);
      const status = getHttpErrorStatus(error);
      if (status === 401) {
        await handleSessionExpired({ redirect: true, showToast: true });
      } else if (status === 403) {
        handleUnauthorizedAccess();
      }
    }
  }, [handleSessionExpired, handleUnauthorizedAccess]);

  useEffect(() => {
    const onSessionExpired = (event: Event) => {
      const detail = (event as CustomEvent<SessionExpiredEventDetail>).detail;
      handleSessionExpired({
        redirect: detail?.redirect ?? true,
        showToast: detail?.showToast ?? true,
      });
    };

    window.addEventListener(SESSION_EXPIRED_EVENT, onSessionExpired);
    return () =>
      window.removeEventListener(SESSION_EXPIRED_EVENT, onSessionExpired);
  }, [handleSessionExpired]);

  useEffect(() => {
    const onVisibilityChange = () => {
      if (
        document.visibilityState === 'visible' &&
        auth.currentUser &&
        userRef.current
      ) {
        validateActiveSession();
      }
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    return () =>
      document.removeEventListener('visibilitychange', onVisibilityChange);
  }, [validateActiveSession]);

  const hasCompletedOnboarding = useCallback(
    (userData: AuthenticatedUser): boolean => {
      // Check if user has tenantId (indicates onboarding is completed)
      return !!userData.tenantId;
    },
    [],
  );

  const fetchAdditionalProfileData = useCallback(
    async (
      authenticatedUser: AuthenticatedUser,
    ): Promise<AuthenticatedUser> => {
      try {
        const additionalProfileData = await fetchFullUserProfile(
          authenticatedUser.userId,
          authenticatedUser.tenantId,
        );

        // Merge additional profile data with authenticated user
        return {
          ...authenticatedUser,
          metadata: {
            ...authenticatedUser.metadata,
            profilePicture: additionalProfileData.profilePictureUrl,
          },
        };
      } catch (error) {
        logError('Error fetching additional profile data', error);
        // Return the original user data if profile fetch fails
        return authenticatedUser;
      }
    },
    [],
  );

  const authenticateAfterSignup = useCallback(
    async (email: string, password: string) => {
      try {
        // Authenticate with Firebase
        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password,
        );
        const token = await userCredential.user.getIdToken();

        // Store Firebase token
        setFirebaseToken(token);

        // For new signups, we don't fetch user data immediately
        // as they need to complete onboarding first
        const newUser: AuthenticatedUser = {
          tenantName: '',
          email: email,
          tenantId: '',
          roleId: '',
          userId: '',
          role: UserRole.READ_ONLY,
        };

        dispatch({
          type: 'SET_USER_DATA',
          payload: { user: newUser, isOnboardingCompleted: false },
        });

        setSessionItem(ONBOARDING_COMPLETED_KEY, false);
      } catch (error) {
        logError('Error during post-signup authentication', error);
        dispatch({ type: 'CLEAR_AUTH' });
        removeSessionItem(USER_STORAGE_KEY);
        removeSessionItem(ONBOARDING_COMPLETED_KEY);
        removeFirebaseToken();
        await auth.signOut();
        throw error;
      }
    },
    [],
  );

  const markOnboardingCompleted = useCallback(() => {
    dispatch({ type: 'SET_ONBOARDING_COMPLETED', payload: true });
    setSessionItem(ONBOARDING_COMPLETED_KEY, true);
  }, []);

  const clearAuthStateRef = useRef(clearAuthState);
  const handleSessionExpiredRef = useRef(handleSessionExpired);
  const handleUnauthorizedAccessRef = useRef(handleUnauthorizedAccess);
  const redirectToLoginRef = useRef(redirectToLogin);
  const fetchAdditionalProfileDataRef = useRef(fetchAdditionalProfileData);
  const hasCompletedOnboardingRef = useRef(hasCompletedOnboarding);

  useEffect(() => {
    clearAuthStateRef.current = clearAuthState;
    handleSessionExpiredRef.current = handleSessionExpired;
    handleUnauthorizedAccessRef.current = handleUnauthorizedAccess;
    redirectToLoginRef.current = redirectToLogin;
    fetchAdditionalProfileDataRef.current = fetchAdditionalProfileData;
    hasCompletedOnboardingRef.current = hasCompletedOnboarding;
  }, [
    clearAuthState,
    fetchAdditionalProfileData,
    handleSessionExpired,
    handleUnauthorizedAccess,
    hasCompletedOnboarding,
    redirectToLogin,
  ]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      // Check if we're on the unauthorized page - if so, don't attempt auth
      const currentPath = window.location.pathname;

      if (['/unauthorized', '/login'].includes(currentPath)) {
        dispatch({ type: 'SET_LOADING', payload: false });
        return;
      }

      if (firebaseUser) {
        // First, try to load user data from session storage to avoid re-fetching
        const storedUser = getSessionItem<AuthenticatedUser>(USER_STORAGE_KEY);
        const storedOnboardingStatus = getSessionItem<boolean>(
          ONBOARDING_COMPLETED_KEY,
        );

        if (storedUser && storedOnboardingStatus !== null) {
          try {
            await validateLogin();
            dispatch({
              type: 'SET_USER_DATA',
              payload: {
                user: storedUser,
                isOnboardingCompleted: storedOnboardingStatus,
              },
            });
          } catch (error) {
            logError('Error validating restored session', error);
            const status = getHttpErrorStatus(error);
            if (status === 401) {
              await handleSessionExpiredRef.current({
                redirect: true,
                showToast: true,
              });
            } else if (status === 403) {
              dispatch({ type: 'SET_LOADING', payload: false });
              handleUnauthorizedAccessRef.current();
            } else if (isTransientNetworkError(error)) {
              dispatch({
                type: 'SET_USER_DATA',
                payload: {
                  user: storedUser,
                  isOnboardingCompleted: storedOnboardingStatus,
                },
              });
            } else {
              await handleSessionExpiredRef.current({
                redirect: false,
                showToast: false,
              });
            }
          }
          return;
        }

        // If no user data in session storage, then fetch from backend
        try {
          const userData: {
            name: string;
            tenantId: string;
            email: string;
            roleId: string;
            id: string;
            roles: Array<{ name: string }>;
          } = await validateLogin();

          const authenticatedUser: AuthenticatedUser = {
            tenantName: userData.name,
            email: userData.email,
            tenantId: userData.tenantId,
            roleId: userData.roleId,
            userId: userData.id,
            role: (userData.roles?.[0]?.name as UserRole) || UserRole.READ_ONLY,
          };

          const userWithAdditionalData =
            await fetchAdditionalProfileDataRef.current(authenticatedUser);

          const onboardingCompleted =
            hasCompletedOnboardingRef.current(authenticatedUser);

          // Batch all state updates into a single dispatch
          dispatch({
            type: 'SET_USER_DATA',
            payload: {
              user: userWithAdditionalData,
              isOnboardingCompleted: onboardingCompleted,
            },
          });

          setSessionItem(USER_STORAGE_KEY, userWithAdditionalData);
          setSessionItem(ONBOARDING_COMPLETED_KEY, onboardingCompleted);
        } catch (error) {
          logError('Error authenticating user', error);
          const status = getHttpErrorStatus(error);
          if (status === 403) {
            dispatch({ type: 'SET_LOADING', payload: false });
            handleUnauthorizedAccessRef.current();
            return;
          }
          if (status === 401) {
            await handleSessionExpiredRef.current({
              redirect: true,
              showToast: true,
            });
            return;
          }
          await handleSessionExpiredRef.current({
            redirect: false,
            showToast: false,
          });
        }
      } else {
        // No Firebase user — validate cookies for unified-login SSO (skip during logout/teardown)
        if (isHandlingSessionExpiryRef.current) {
          dispatch({ type: 'SET_LOADING', payload: false });
          return;
        }

        try {
          const userData = await validateCookies();
          const authenticatedUser: AuthenticatedUser = {
            tenantName: userData.name,
            email: userData.email,
            tenantId: userData.tenantId,
            roleId: userData.role?.id || '',
            userId: userData.id,
            role: (userData.role?.name as UserRole) || UserRole.READ_ONLY,
            metadata: userData.metadata,
          };

          if (userData.metadata?.preferredLanguage) {
            setUserLocale(userData.metadata.preferredLanguage);
          }
          const userWithAdditionalData =
            await fetchAdditionalProfileDataRef.current(authenticatedUser);

          const onboardingCompleted = hasCompletedOnboardingRef.current(
            userWithAdditionalData,
          );
          dispatch({
            type: 'SET_USER_DATA',
            payload: {
              user: userWithAdditionalData,
              isOnboardingCompleted: onboardingCompleted,
            },
          });

          setSessionItem(USER_STORAGE_KEY, authenticatedUser);
        } catch (error) {
          logError('Error validating cookies', error);

          const status = getHttpErrorStatus(error);
          if (status === 401) {
            await handleSessionExpiredRef.current({
              redirect: true,
              showToast: true,
            });
            return;
          }

          try {
            await logOut();
          } catch (logoutError) {
            logError(
              'Error calling logout API after cookie validation failure',
              logoutError,
            );
          }

          clearAuthStateRef.current();

          if (status === 403) {
            handleUnauthorizedAccessRef.current();
            return;
          }

          redirectToLoginRef.current();
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      // First authenticate with Firebase
      await signInWithEmailAndPassword(auth, email, password);

      // The useEffect will handle fetching user data after Firebase auth state changes
    } catch (error) {
      if (error instanceof FirebaseError) {
        throw new Error(`Authentication failed: ${error.message}`);
      }
      throw new Error('Unexpected error during authentication');
    }
  }, []);

  const logout = useCallback(async () => {
    await handleSessionExpired({ redirect: true, showToast: false });
  }, [handleSessionExpired]);

  const contextValue = useMemo(
    () => ({
      user: state.user,
      isLoading: state.isLoading,
      isAuthenticated: state.isAuthenticated,
      isOnboardingCompleted: state.isOnboardingCompleted,
      hasCompletedOnboarding: state.user
        ? hasCompletedOnboarding(state.user)
        : false,
      login,
      logout,
      authenticateAfterSignup,
      markOnboardingCompleted,
    }),
    [
      state.user,
      state.isLoading,
      state.isAuthenticated,
      state.isOnboardingCompleted,
      login,
      logout,
      authenticateAfterSignup,
      markOnboardingCompleted,
      hasCompletedOnboarding,
    ],
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
