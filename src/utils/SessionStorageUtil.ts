export const sessionStorageUtil = {
  get<T = string>(key: string): T | null {
    if (typeof window === 'undefined') return null;
    const value = sessionStorage.getItem(key);
    try {
      return value ? (JSON.parse(value) as T) : null;
    } catch {
      return (value as unknown as T) || null;
    }
  },

  set<T = string>(key: string, value: T) {
    if (typeof window === 'undefined') return;
    if (typeof value === 'string') {
      sessionStorage.setItem(key, value);
    } else {
      sessionStorage.setItem(key, JSON.stringify(value));
    }
  },

  remove(key: string) {
    if (typeof window === 'undefined') return;
    sessionStorage.removeItem(key);
  },
};
