'use client';

import React, { useMemo, useEffect } from 'react';
import { InputField, InputDropdown } from '@merit-incentives/ui';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Send } from 'lucide-react';

import { BaseDialog } from '@/components/BaseDialog';
import { useLocalization } from '@/hooks';
import { createUserFormSchema } from '@/utils/formSchemas';
import {
  InviteUserDialogProps,
  InviteUserFormData,
  InviteUserFormFieldsProps,
} from '@/types/accessManagement';

const FormFields = ({
  translate,
  register,
  errors,
  roleOptions,
  domainOptions,
  role,
  domain,
  setValue,
}: InviteUserFormFieldsProps) => (
  <>
    <InputField
      label={translate('fullName')}
      placeholder={translate('fullNamePlaceholder')}
      error={errors.fullName?.message}
      {...register('fullName')}
      required
    />
    <InputField
      label={translate('email')}
      type="email"
      placeholder={translate('emailPlaceholder')}
      error={errors.email?.message}
      {...register('email')}
      required
    />
    <InputDropdown
      label={translate('role')}
      placeholder={translate('selectRole')}
      options={roleOptions}
      value={role || ''}
      onChange={(value) => setValue('role', value, { shouldValidate: true })}
      error={errors.role?.message}
      required
    />
    <InputDropdown
      label={translate('domain')}
      placeholder={translate('selectDomain')}
      options={domainOptions}
      value={domain || ''}
      onChange={(value) => setValue('domain', value, { shouldValidate: true })}
      error={errors.domain?.message}
      required
    />
  </>
);

export function InviteUserDialog({
  isOpen,
  onClose,
  onInvite,
  roleOptions,
  domainOptions,
  isLoading = false,
}: Readonly<InviteUserDialogProps>) {
  const { translate } = useLocalization('inviteUserDialog');

  const formSchema = useMemo(
    () => createUserFormSchema(translate),
    [translate],
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<InviteUserFormData>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
  });

  const [domain, role] = [watch('domain'), watch('role')];

  useEffect(() => {
    if (!isOpen) reset();
  }, [isOpen, reset]);

  const onSubmit = (data: InviteUserFormData) => {
    onInvite(data.fullName, data.email, data.domain, data.role);
  };

  return (
    <BaseDialog
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit(onSubmit)}
      isLoading={isLoading}
      title={translate('title')}
      description={translate('description')}
      submitButtonText={translate('submit')}
      submitButtonIcon={<Send />}
    >
      <FormFields
        translate={translate}
        register={register}
        errors={errors}
        roleOptions={roleOptions}
        domainOptions={domainOptions}
        role={role}
        domain={domain}
        setValue={setValue}
      />
    </BaseDialog>
  );
}
