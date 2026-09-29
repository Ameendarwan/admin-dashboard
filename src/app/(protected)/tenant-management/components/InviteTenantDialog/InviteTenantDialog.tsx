'use client';

import * as z from 'zod';
import {
  Button,
  InputDropdown,
  InputField,
} from '@merit-incentives/ui/components';
import { Send } from 'lucide-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { BaseDialog, CountrySearch, FileUpload } from '@/components';
import { Product } from '@/lib/enums';
import { useClickOutside, useLocalization } from '@/hooks';
import type { InviteTenantFormData } from '@/types/tenantManagement';
import { ACCOUNT_MANAGERS } from '@/constants/tenant';

const DEFAULT_INVITE_FORM_VALUES: InviteTenantFormData = {
  email: '',
  businessName: '',
  country: '',
  accountManager: '',
  products: [],
  businessContract: undefined,
};

const getFormSchema = (translate: (key: string) => string) => {
  return z.object({
    email: z.email(translate('validation.emailInvalid')),
    businessName: z
      .string()
      .min(1, translate('validation.businessNameRequired')),
    country: z.string().optional(),
    accountManager: z.string().optional(),
    products: z.array(z.enum(Product)),
    businessContract: z.custom<File>().optional(),
  });
};

interface InviteTenantDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onInvite: (data: InviteTenantFormData) => void;
  isLoading?: boolean;
}

export function InviteTenantDialog({
  isOpen,
  onClose,
  onInvite,
  isLoading = false,
}: Readonly<InviteTenantDialogProps>) {
  const { translate } = useLocalization('inviteTenantDialog');

  const formSchema = useMemo(() => getFormSchema(translate), [translate]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<InviteTenantFormData>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    defaultValues: DEFAULT_INVITE_FORM_VALUES,
  });

  useEffect(() => {
    if (!isOpen) return;
    reset(DEFAULT_INVITE_FORM_VALUES);
    setIsAccountManagerDropdownOpen(false);
  }, [isOpen, reset]);

  const businessContract = watch('businessContract');
  const selectedCountry = watch('country');

  const [isAccountManagerDropdownOpen, setIsAccountManagerDropdownOpen] =
    useState(false);
  const accountManagerDropdownRef = useRef<HTMLDivElement>(null);

  useClickOutside(
    accountManagerDropdownRef,
    () => setIsAccountManagerDropdownOpen(false),
    isAccountManagerDropdownOpen,
  );

  const onSubmit = (data: InviteTenantFormData) => {
    onInvite(data);
  };

  const handleClose = () => {
    reset(DEFAULT_INVITE_FORM_VALUES);
    setIsAccountManagerDropdownOpen(false);
    onClose();
  };

  return (
    <BaseDialog
      isOpen={isOpen}
      onClose={handleClose}
      onSubmit={handleSubmit(onSubmit)}
      isLoading={isLoading}
      title={translate('title')}
      description=""
      submitButtonIcon={<Send />}
      submitButtonText={translate('actions.saveAndInvite')}
      closeOnOutsideClick={false}
      secondaryButtonText={translate('actions.cancel')}
      onSecondaryAction={handleClose}
    >
      <div className="flex gap-6">
        <InputField
          label={translate('fields.businessName')}
          placeholder={translate('fields.businessNamePlaceholder')}
          required
          {...register('businessName')}
          error={errors.businessName?.message}
          type="text"
        />
        <InputField
          label={translate('fields.email')}
          placeholder={translate('fields.emailPlaceholder')}
          required
          {...register('email')}
          error={errors.email?.message}
          type="email"
        />
      </div>

      <div className="flex gap-6">
        <div className="flex-1">
          <div className="relative" ref={accountManagerDropdownRef}>
            <InputDropdown
              id="account-manager-dropdown"
              label={translate('fields.accountManager')}
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
              onClick={() => setIsAccountManagerDropdownOpen((open) => !open)}
              aria-haspopup="listbox"
              aria-expanded={isAccountManagerDropdownOpen}
              placeholder={translate('fields.selectAccountManager')}
            />
            {isAccountManagerDropdownOpen && (
              <div className="absolute z-10 w-full mt-1 bg-mds-white border border-mds-black-100 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {ACCOUNT_MANAGERS.map((manager) => (
                  <Button
                    key={manager}
                    size="md"
                    className="w-full bg-transparent! justify-start px-4 py-2 hover:bg-mds-black-50 text-mds-black-900 rounded-none font-normal"
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

        <CountrySearch
          label={translate('fields.country')}
          placeholder={translate('fields.selectCountry')}
          value={selectedCountry}
          onChange={(countryCode) => {
            setValue('country', countryCode, { shouldValidate: true });
          }}
          error={errors.country?.message}
        />
      </div>

      <FileUpload
        label={translate('fields.uploadBusinessContract')}
        file={businessContract ?? null}
        onFileChange={(file) => {
          setValue('businessContract', file ?? undefined, {
            shouldValidate: true,
          });
        }}
        error={errors.businessContract?.message}
        accept=".pdf,.doc,.docx"
        required={false}
        uploadText={translate('fields.clickToUpload')}
        dragDropText={translate('fields.dragAndDrop')}
        requirementsText={translate('fields.contractRequirements')}
        fileCompleteText={translate('fields.fileComplete')}
      />
    </BaseDialog>
  );
}
