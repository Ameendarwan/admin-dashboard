'use client';

import React, { useMemo } from 'react';
import { Check } from 'lucide-react';
import { Popup } from '@merit-incentives/ui/components';

import { useLocalization } from '@/hooks/useLocalization';
import { PermissionsDialogProps, Permission } from '@/types/accessManagement';

const permissionsData: Permission[] = [
  { key: 'memberSearchView', admin: true, lead: true, staff: true },
  { key: 'pointsAdjustment', admin: true, lead: true, staff: true },
  { key: 'campaignCreation', admin: true, lead: true, staff: false },
  { key: 'voucherUploadGeneration', admin: true, lead: true, staff: false },
  { key: 'viewInsights', admin: true, lead: true, staff: false },
  { key: 'configureTiersSegments', admin: true, lead: true, staff: false },
  { key: 'apiKeyManagement', admin: true, lead: false, staff: false },
  { key: 'userRoleManagement', admin: true, lead: false, staff: false },
];

export function PermissionsDialog({
  isOpen,
  onClose,
}: Readonly<PermissionsDialogProps>) {
  const { translate } = useLocalization('permissionsDialog');

  const permissions = useMemo(
    () =>
      permissionsData.map((perm) => ({
        ...perm,
        label: translate(`permissions.${perm.key}`),
      })),
    [translate],
  );

  if (!isOpen) return null;

  return (
    <Popup isOpen={isOpen} onClose={onClose} size="lg" className="w-225">
      <Popup.Header
        onClose={onClose}
        showDivider
        className="py-mds-xl px-mds-2xl"
      >
        <div className="flex flex-col gap-mds-md">
          <h1 className="text-2xl font-bold text-mds-black-900">
            {translate('title')}
          </h1>
          <p className="text-base font-medium text-mds-black-600 leading-[140%]">
            {translate('description')}
          </p>
        </div>
      </Popup.Header>

      <Popup.Content className="p-mds-2xl!">
        <div className="space-y-2">
          {/* Header Row */}
          <div className="grid grid-cols-4 gap-1 py-3 text-sm font-semibold text-mds-black-700">
            <div className="bg-mds-bg-light-50 pl-4 rounded-sm">
              {translate('featureArea')}
            </div>
            {['admin', 'lead', 'staff'].map((role) => (
              <div
                key={role}
                className="bg-mds-bg-light-50 text-center rounded-sm"
              >
                {translate(role)}
              </div>
            ))}
          </div>

          {/* Permission Rows */}
          {permissions.map((row, index) => (
            <div
              key={row.key}
              className={`grid grid-cols-4 items-center rounded-md px-4 py-3 ${
                index % 2 === 0 ? 'bg-mds-bg-light-50' : ''
              }`}
            >
              <div className="text-sm font-medium text-mds-black-900">
                {row.label}
              </div>
              {(['admin', 'lead', 'staff'] as const).map((role) => (
                <div key={role} className="flex justify-center">
                  {row[role] ? (
                    <Check
                      className="h-4 w-4 text-mds-primary-600"
                      strokeWidth={3}
                    />
                  ) : (
                    <span />
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </Popup.Content>
    </Popup>
  );
}
