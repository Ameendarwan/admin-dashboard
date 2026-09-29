'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  InputDropdown,
  InputField,
} from '@merit-incentives/ui/components';
import { toast } from '@merit-incentives/ui';

import { BaseDialog, CountrySearch } from '@/components';
import { useClickOutside, useLocalization } from '@/hooks';
import {
  useIdentityTenant,
  useUpdateIdentityTenant,
} from '@/api-queries/tenantManagement';
import { ACCOUNT_MANAGERS } from '@/constants/tenant';

import { EditTenantReadOnlyField } from './EditTenantReadOnlyField';
import {
  createEditTenantFormSchema,
  type EditTenantFormValues,
} from './editTenantDialogSchema';

type EditTenantDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  tenantId: string;
  onSaved?: (values: EditTenantFormValues) => void;
};

export function EditTenantDialog({
  isOpen,
  onClose,
  tenantId,
  onSaved,
}: Readonly<EditTenantDialogProps>) {
  const { translate } = useLocalization('tenant-details');
  const formSchema = useMemo(
    () => createEditTenantFormSchema(translate),
    [translate],
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<EditTenantFormValues>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    defaultValues: {
      businessName: '',
      country: '',
      accountManager: '',
    },
  });

  const {
    data: identityTenant,
    isLoading: isLoadingTenant,
    isError: isLoadError,
    refetch,
  } = useIdentityTenant(tenantId, isOpen);

  const updateMutation = useUpdateIdentityTenant();

  const selectedCountry = watch('country');
  const [isAccountManagerDropdownOpen, setIsAccountManagerDropdownOpen] =
    useState(false);
  const accountManagerDropdownRef = useRef<HTMLDivElement>(null);

  useClickOutside(
    accountManagerDropdownRef,
    () => setIsAccountManagerDropdownOpen(false),
    isAccountManagerDropdownOpen,
  );

  useEffect(() => {
    if (!isOpen) return;
    setIsAccountManagerDropdownOpen(false);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !identityTenant) return;
    reset({
      businessName:
        identityTenant.businessName?.trim() ||
        identityTenant.name?.trim() ||
        '',
      country: identityTenant.country ?? '',
      accountManager: identityTenant.accountManager ?? '',
    });
  }, [isOpen, identityTenant, reset]);

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = (values: EditTenantFormValues) => {
    if (!tenantId) return;
    updateMutation.mutate(
      {
        tenantId,
        payload: {
          businessName: values.businessName.trim(),
          country: values.country?.trim() || undefined,
          accountManager: values.accountManager?.trim() || undefined,
        },
      },
      {
        onSuccess: () => {
          toast.success(translate('editDialog.toast.success'));
          onSaved?.(values);
          handleClose();
        },
        onError: () => {
          toast.error(translate('editDialog.toast.error'));
        },
      },
    );
  };

  return (
    <BaseDialog
      isOpen={isOpen}
      onClose={handleClose}
      onSubmit={handleSubmit(onSubmit)}
      isLoading={
        updateMutation.isPending ||
        isLoadingTenant ||
        !identityTenant ||
        isLoadError
      }
      title={translate('editDialog.title')}
      description=""
      submitButtonText={translate('editDialog.save')}
      closeOnOutsideClick={false}
      secondaryButtonText={translate('editDialog.cancel')}
      onSecondaryAction={handleClose}
    >
      {isLoadError && (
        <div className="flex flex-col gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <span>{translate('editDialog.loadError')}</span>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => refetch()}
          >
            {translate('editDialog.retry')}
          </Button>
        </div>
      )}

      {isLoadingTenant && !identityTenant && !isLoadError ? (
        <p className="text-sm text-mds-black-600">
          {translate('editDialog.loading')}
        </p>
      ) : null}

      {identityTenant && !isLoadError ? (
        <>
          <div className="flex flex-col gap-6 md:flex-row md:items-start">
            <div className="min-w-0 flex-1">
              <InputField
                label={translate('editDialog.fields.businessName')}
                required
                {...register('businessName')}
                error={errors.businessName?.message}
                type="text"
              />
            </div>
            <div className="min-w-0 flex-1">
              <EditTenantReadOnlyField
                label={translate('editDialog.fields.businessOwnerEmail')}
                value={
                  typeof identityTenant.metadata?.businessOwnerEmail ===
                  'string'
                    ? identityTenant.metadata.businessOwnerEmail
                    : '—'
                }
              />
            </div>
          </div>

          <div className="flex flex-col gap-6 md:flex-row md:items-start">
            <div className="min-w-0 flex-1">
              <div className="relative" ref={accountManagerDropdownRef}>
                <InputDropdown
                  id="edit-tenant-account-manager"
                  label={translate('editDialog.fields.accountManager')}
                  value={watch('accountManager')}
                  options={ACCOUNT_MANAGERS.map((manager) => ({
                    value: manager,
                    label: manager,
                    checked: watch('accountManager') === manager,
                  }))}
                  onChange={(value: string) => {
                    setValue('accountManager', value, { shouldValidate: true });
                    setIsAccountManagerDropdownOpen(false);
                  }}
                  error={errors.accountManager?.message ?? ''}
                  onClick={() =>
                    setIsAccountManagerDropdownOpen((open) => !open)
                  }
                  aria-haspopup="listbox"
                  aria-expanded={isAccountManagerDropdownOpen}
                  placeholder={translate(
                    'editDialog.fields.selectAccountManager',
                  )}
                />
                {isAccountManagerDropdownOpen && (
                  <div className="absolute z-10 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-mds-black-100 bg-mds-white shadow-lg">
                    {ACCOUNT_MANAGERS.map((manager) => (
                      <Button
                        key={manager}
                        type="button"
                        size="md"
                        className="w-full justify-start rounded-none border-0 bg-transparent! px-4 py-2 font-normal text-mds-black-900 hover:bg-mds-black-50"
                        onClick={() => {
                          setValue('accountManager', manager, {
                            shouldValidate: true,
                          });
                          setIsAccountManagerDropdownOpen(false);
                        }}
                      >
                        {manager}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <CountrySearch
                label={translate('editDialog.fields.country')}
                placeholder={translate('editDialog.fields.selectCountry')}
                value={selectedCountry}
                onChange={(countryCode) => {
                  setValue('country', countryCode, { shouldValidate: true });
                }}
                error={errors.country?.message}
              />
            </div>
          </div>
        </>
      ) : null}
    </BaseDialog>
  );
}
