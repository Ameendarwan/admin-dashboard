'use client';

import React, { useMemo, useEffect } from 'react';
import { InputField, InputDropdown } from '@merit-incentives/ui';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { BaseDialog } from '@/components/BaseDialog';
import { useLocalization } from '@/hooks';
import { createEditUserFormSchema } from '@/utils/formSchemas';
import {
  EditUserDialogProps,
  EditUserFormData,
} from '@/types/accessManagement';

export function EditUserDialog({
  isOpen,
  onClose,
  onSave,
  userData,
  roleOptions,
  domainOptions,
  isLoading = false,
}: Readonly<EditUserDialogProps>) {
  const { translate } = useLocalization('editUserDialog');

  const formSchema = useMemo(
    () => createEditUserFormSchema(translate),
    [translate],
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<EditUserFormData>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
  });

  const domain = watch('domain');
  const role = watch('role');
  const status = watch('status');

  useEffect(() => {
    if (isOpen && userData) {
      reset({
        fullName: userData.fullName,
        email: userData.email,
        domain: userData.domain,
        role: userData.role,
        status: userData.status,
      });
    } else if (!isOpen) {
      reset();
    }
  }, [isOpen]);

  // Status options
  const statusOptions = useMemo(
    () => [
      { value: 'active', label: translate('statusActive') },
      { value: 'inactive', label: translate('statusInactive') },
    ],
    [translate],
  );

  const onSubmit = (data: EditUserFormData) => {
    onSave(data.fullName, data.email, data.domain, data.role, data.status);
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <BaseDialog
      isOpen={isOpen}
      onClose={handleClose}
      onSubmit={handleSubmit(onSubmit)}
      isLoading={isLoading}
      title={translate('title')}
      submitButtonText={translate('submit')}
    >
      {/* Full Name */}
      <InputField
        label={translate('fullName')}
        placeholder={translate('fullNamePlaceholder')}
        error={errors.fullName?.message}
        {...register('fullName')}
        required
      />

      {/* Email (Disabled) */}
      <InputField
        label={translate('email')}
        type="email"
        placeholder={translate('emailPlaceholder')}
        error={errors.email?.message}
        {...register('email')}
        disabled
        required
      />

      {/* Role */}
      <InputDropdown
        label={translate('role')}
        placeholder={translate('selectRole')}
        options={roleOptions}
        value={role || ''}
        onChange={(value) => setValue('role', value, { shouldValidate: true })}
        error={errors.role?.message}
        required
      />

      {/* Domain */}
      <InputDropdown
        label={translate('domain')}
        placeholder={translate('selectDomain')}
        options={domainOptions}
        value={domain || ''}
        onChange={(value) =>
          setValue('domain', value, { shouldValidate: true })
        }
        error={errors.domain?.message}
        required
      />

      {/* Account Status */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <p className="text-lg font-medium text-mds-black-900 leading-[1.2]">
            {translate('accountStatus')}
          </p>
          <p className="text-sm font-medium text-mds-black-900 leading-[1.4]">
            {translate('accountStatusDescription')}
          </p>
        </div>
        <InputDropdown
          label={translate('accountStatusLabel')}
          placeholder={translate('selectStatus')}
          options={statusOptions}
          value={status || ''}
          onChange={(value) =>
            setValue('status', value, { shouldValidate: true })
          }
          error={errors.status?.message}
          required
        />
      </div>
    </BaseDialog>
  );
}
