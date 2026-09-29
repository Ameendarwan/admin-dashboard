import { atom } from 'jotai';

// Simple counter atom
export const counterAtom = atom(0);

// Derived atom that doubles the counter value
export const doubledCounterAtom = atom((get) => get(counterAtom) * 2);

// Atom for user preferences
export const userPreferencesAtom = atom({
  theme: 'light' as 'light' | 'dark',
  language: 'en' as 'en' | 'ar',
  notifications: true,
});

// Atom for form data
export const formDataAtom = atom({
  name: '',
  email: '',
  message: '',
});
