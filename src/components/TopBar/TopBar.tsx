import { TopBar as MeritTopBar, toast } from '@merit-incentives/ui';
import React, { useRef, useState } from 'react';
import { LogOut } from 'lucide-react';

import { useAuth } from '@/app/contexts/auth-context';
import { useClickOutside } from '@/hooks/useClickOutside';
import { useLocalization } from '@/hooks/useLocalization';

export function TopBar() {
  const { user, logout } = useAuth();
  const { translate } = useLocalization();
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Prepare user data for the TopBar
  const userData = user
    ? {
        name: user.tenantName || '',
        email: user.email || '',
        fallback: user.tenantName ? user.tenantName[0] : '',
        src: user.metadata?.profilePicture || '',
      }
    : undefined;

  const handleUserClick = () => {
    setShowUserDropdown((prev) => !prev);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      // Error logging out
      toast.error(translate('logoutError'));
    }
  };

  // Close dropdown when clicking outside
  useClickOutside(
    dropdownRef,
    () => setShowUserDropdown(false),
    showUserDropdown,
  );

  return (
    <>
      <MeritTopBar
        title="LiveOps"
        user={userData}
        sticky={true}
        zIndex={50}
        className="p-4 px-6"
        onUserClick={handleUserClick}
      />
      {/* User Dropdown Menu */}
      {showUserDropdown && (
        <div
          ref={dropdownRef}
          className="absolute end-0 top-15 z-50 w-56 rounded-lg border border-gray-200 bg-white shadow-lg"
        >
          <div className="py-2">
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50"
            >
              <LogOut className="h-4 w-4" />
              <span className="font-medium">{translate('logout')}</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
