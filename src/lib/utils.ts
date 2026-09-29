import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { logError } from '@/utils/errorLogger';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Custom SyncStorage for sessionStorage for Jotai atoms
export const sessionStorageSync = {
  getItem: (key: string) => {
    const value = sessionStorage.getItem(key);
    return value ? JSON.parse(value) : {};
  },
  setItem: (key: string, value: { [key: string]: boolean }) => {
    sessionStorage.setItem(key, JSON.stringify(value));
  },
  removeItem: (key: string) => {
    sessionStorage.removeItem(key);
  },
};

// Generic session storage helpers
export const setSessionItem = <T>(key: string, value: T): void => {
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    logError(`Error saving item to session storage for key "${key}"`, error);
  }
};

export const getSessionItem = <T>(key: string): T | null => {
  try {
    const value = sessionStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : null;
  } catch (error) {
    logError(`Error loading item from session storage for key "${key}"`, error);
    return null;
  }
};

export const removeSessionItem = (key: string): void => {
  try {
    sessionStorage.removeItem(key);
  } catch (error) {
    logError(
      `Error removing item from session storage for key "${key}"`,
      error,
    );
  }
};

// Firebase token management utilities
export const getFirebaseToken = (): string | null => {
  return getSessionItem<string>('firebaseToken');
};

export const setFirebaseToken = (token: string): void => {
  setSessionItem('firebaseToken', token);
};

export const removeFirebaseToken = (): void => {
  removeSessionItem('firebaseToken');
};

/**
 * Download utility functions
 */

/**
 * Downloads a file from a URL with proper error handling and fallback
 * @param url - The URL to download the file from
 * @param fileName - The name to save the file as
 * @returns Promise that resolves when download is complete or rejects on error
 */
async function fetchUrlAsBlob(url: string): Promise<Blob> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.blob();
}

export const downloadFile = async (
  url: string,
  fileName: string = 'document',
): Promise<void> => {
  const blob = await fetchUrlAsBlob(url);
  const objectUrl = globalThis.URL.createObjectURL(blob);

  // Create a temporary link to download the file
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = fileName;
  link.style.display = 'none';
  globalThis.document.body.appendChild(link);
  link.click();
  link.remove();

  // Clean up the object URL
  globalThis.URL.revokeObjectURL(objectUrl);
};

export const downloadAttachment = async (
  downloadUrl: string,
  fileName: string,
): Promise<void> => {
  if (!downloadUrl) {
    throw new Error('Download URL is not available');
  }

  return downloadFile(downloadUrl, fileName || 'document');
};

export const openFetchedUrlInNewTab = async (url: string): Promise<void> => {
  if (!url) {
    throw new Error('URL is not available');
  }
  const newWindow = globalThis.open('about:blank', '_blank');
  if (!newWindow) {
    throw new Error('Popup blocked');
  }
  try {
    const blob = await fetchUrlAsBlob(url);
    const objectUrl = globalThis.URL.createObjectURL(blob);
    newWindow.location.href = objectUrl;
    globalThis.setTimeout(
      () => globalThis.URL.revokeObjectURL(objectUrl),
      120_000,
    );
  } catch (e) {
    newWindow.close();
    throw e;
  }
};

export function formatCurrency(
  amount: number,
  currency: string = 'USD',
): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Clears all cookies starting with 'merit_' prefix.
 * Clears cookies for current domain, subdomains, and parent domain.
 */
export const clearAllCookies = (): void => {
  if (typeof document === 'undefined') return;

  const cookies = document.cookie.split(';');
  const domain = window.location.hostname;
  const parts = domain.split('.');
  const parentDomain = parts.length > 2 ? parts.slice(-2).join('.') : null;

  for (const cookie of cookies) {
    const eqPos = cookie.indexOf('=');
    const name = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim();

    if (!name.startsWith('merit_')) {
      continue;
    }

    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${domain}`;

    if (parentDomain) {
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.${parentDomain}`;
    }
  }
};
