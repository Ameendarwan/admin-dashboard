'use client';

import React from 'react';
import { useAtom } from 'jotai';

import {
  counterAtom,
  doubledCounterAtom,
  userPreferencesAtom,
  formDataAtom,
} from '@/atoms/testAtom';

export function JotaiTestComponent() {
  const [counter, setCounter] = useAtom(counterAtom);
  const [doubledCounter] = useAtom(doubledCounterAtom);
  const [userPreferences, setUserPreferences] = useAtom(userPreferencesAtom);
  const [formData, setFormData] = useAtom(formDataAtom);

  const handleIncrement = () => {
    setCounter(counter + 1);
  };

  const handleDecrement = () => {
    setCounter(counter - 1);
  };

  const handleThemeToggle = () => {
    setUserPreferences((prev) => ({
      ...prev,
      theme: prev.theme === 'light' ? 'dark' : 'light',
    }));
  };

  const handleFormChange =
    (field: keyof typeof formData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormData((prev) => ({
        ...prev,
        [field]: e.target.value,
      }));
    };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-md space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        Jotai Test Component
      </h2>

      {/* Counter Section */}
      <div className="border rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-2">Counter Test</h3>
        <div className="flex items-center gap-4 mb-2">
          <button
            onClick={handleDecrement}
            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
          >
            -
          </button>
          <span className="text-xl font-bold">Counter: {counter}</span>
          <button
            onClick={handleIncrement}
            className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
          >
            +
          </button>
        </div>
        <p className="text-sm text-gray-600">Doubled: {doubledCounter}</p>
      </div>

      {/* User Preferences Section */}
      <div className="border rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-2">User Preferences</h3>
        <div className="space-y-2">
          <p className="text-sm">
            Theme: <span className="font-medium">{userPreferences.theme}</span>
          </p>
          <p className="text-sm">
            Language:{' '}
            <span className="font-medium">{userPreferences.language}</span>
          </p>
          <p className="text-sm">
            Notifications:{' '}
            <span className="font-medium">
              {userPreferences.notifications ? 'On' : 'Off'}
            </span>
          </p>
          <button
            onClick={handleThemeToggle}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
          >
            Toggle Theme
          </button>
        </div>
      </div>

      {/* Form Data Section */}
      <div className="border rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-2">Form Data</h3>
        <div className="space-y-2">
          <input
            type="text"
            placeholder="Name"
            value={formData.name}
            onChange={handleFormChange('name')}
            className="w-full px-3 py-2 border rounded text-sm"
          />
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleFormChange('email')}
            className="w-full px-3 py-2 border rounded text-sm"
          />
          <textarea
            placeholder="Message"
            value={formData.message}
            onChange={handleFormChange('message')}
            className="w-full px-3 py-2 border rounded text-sm"
            rows={3}
          />
        </div>
      </div>

      {/* Debug Info */}
      <div className="border rounded-lg p-4 bg-gray-50">
        <h3 className="text-lg font-semibold mb-2">Debug Info</h3>
        <pre className="text-xs text-gray-600 overflow-auto">
          {JSON.stringify(
            { counter, doubledCounter, userPreferences, formData },
            null,
            2,
          )}
        </pre>
      </div>
    </div>
  );
}
