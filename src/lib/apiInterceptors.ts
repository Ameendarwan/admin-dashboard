import {
  AxiosError,
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';

import { auth } from '@/lib/firebase/config';
import { logError } from '@/utils/errorLogger';
import { dispatchSessionExpired } from '@/utils/sessionExpiryHandler';

declare module 'axios' {
  export interface AxiosRequestConfig {
    skipSessionExpiryHandler?: boolean;
  }
}

interface ApiResponse {
  message?: string;
  data?: unknown;
  error?: string;
  status?: number;
  errorCode?: string;
  errorMessage?: string;
  [key: string]: unknown;
}

interface InterceptorOptions {
  requireAuth?: boolean; // If false, continues without token
  signOutOn401?: boolean; // If true, signs out user on 401
}

const DEFAULT_INTERCEPTOR_OPTIONS: InterceptorOptions = {
  requireAuth: true,
  signOutOn401: true,
};

type EnhancedApiError = Error & {
  errorCode?: string;
  originalResponse?: unknown;
  statusCode?: number;
};

function shouldDispatchSessionExpired(
  config: InternalAxiosRequestConfig | undefined,
): boolean {
  return !config?.skipSessionExpiryHandler;
}

function resolveNotFoundMessage(data?: ApiResponse): string {
  const notFoundMessage = data?.errorMessage || data?.message;
  if (typeof notFoundMessage === 'string' && notFoundMessage.trim()) {
    return notFoundMessage.trim();
  }
  return 'Requested resource not found.';
}

function extractErrorMessage(response: AxiosResponse<ApiResponse>): string {
  let errorMessage =
    response.data?.message ||
    response.data?.errorMessage ||
    `Unexpected error occurred (Status: ${response.status}).`;

  if (Array.isArray(response.data?.errors)) {
    const errorMessages = response.data.errors
      .flatMap((err: { errors?: string[] }) => err.errors || [])
      .filter(Boolean);
    if (errorMessages.length > 0) {
      errorMessage = errorMessages.join(' | ');
    }
  }

  return errorMessage;
}

function createEnhancedApiError(
  errorMessage: string,
  response: AxiosResponse<ApiResponse>,
): EnhancedApiError {
  const enhancedError = new Error(errorMessage) as EnhancedApiError;
  if (response.data?.errorCode) {
    enhancedError.errorCode = response.data.errorCode;
  }
  enhancedError.originalResponse = response.data;
  enhancedError.statusCode = response.status;
  return enhancedError;
}

function logCurrentUserContext(clientName: string, error: Error): void {
  logError(clientName, error, {
    userId: auth.currentUser?.uid,
    userEmail: auth.currentUser?.email,
    tenantId: auth.currentUser?.tenantId,
  });
}

function handleHttpResponseError(
  status: number,
  response: AxiosResponse<ApiResponse>,
  error: AxiosError<ApiResponse>,
  clientName: string,
  options: InterceptorOptions,
): never {
  switch (status) {
    case 401: // Unauthorized (session cookie expired or invalid)
      if (options.signOutOn401) {
        if (shouldDispatchSessionExpired(error.config)) {
          dispatchSessionExpired({ redirect: true, showToast: true });
        }
        throw error;
      }
      logError(`${clientName}: Unauthorized`, error);
      throw new Error('Unauthorized: Check API credentials.');

    case 403: // Forbidden
      throw error;

    case 500: // Internal Server Error
    // throw new Error('Internal Server Error: Please try again later.');

    case 404:
      throw new Error(resolveNotFoundMessage(response.data));

    default: {
      const enhancedError = createEnhancedApiError(
        extractErrorMessage(response),
        response,
      );
      logCurrentUserContext(`${clientName} Error`, enhancedError);
      throw enhancedError;
    }
  }
}

export const addInterceptors = (
  client: AxiosInstance,
  clientName: string,
  options: InterceptorOptions = DEFAULT_INTERCEPTOR_OPTIONS,
) => {
  // Request interceptor for adding auth token
  client.interceptors.request.use(
    async (config) => {
      try {
        const user = auth.currentUser;

        if (user && !config.headers?.Authorization) {
          const token = await user.getIdToken();
          config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
      } catch (error) {
        logError('Error getting auth token:', error, {
          userEmail: auth.currentUser?.email,
          userId: auth.currentUser?.uid,
          tenantId: auth.currentUser?.tenantId,
        });

        // Only throw if auth is required
        if (options.requireAuth) {
          throw new Error('Failed to authenticate request');
        }
        return config;
      }
    },
    (error) => {
      throw error;
    },
  );

  // Global response interceptor for consistent error handling
  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError<ApiResponse>) => {
      const { response } = error;

      if (!response) {
        logCurrentUserContext(clientName, new Error('Network Error'));
        throw new Error(
          'Network Error: Please check your internet connection.',
        );
      }

      handleHttpResponseError(
        response.status,
        response,
        error,
        clientName,
        options,
      );
    },
  );
};
