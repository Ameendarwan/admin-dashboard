'use client';

import * as z from 'zod';
import React, { useEffect, useMemo, useState } from 'react';
import { InputField, InputDropdown } from '@merit-incentives/ui/components';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { BaseDialog, FileUpload } from '@/components';
import { useLocalization } from '@/hooks/useLocalization';
import { ShippingProvider, SELLER_INVITE_SHIPPING_PROVIDERS } from '@/lib/enums';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_FILE_TYPES = ['application/pdf', 'image/'];
const SELLER_INVITE_SHIPPING_PROVIDER_VALUES = SELLER_INVITE_SHIPPING_PROVIDERS.map(
  (provider) => provider.value,
) as [ShippingProvider, ...ShippingProvider[]];

const getFormSchema = (
  currentStep: number,
  translate: (key: string) => string,
) => {
  return z.object({
    email: z.string().email(translate('validation.emailInvalid')),
    companyName: z.string().min(1, translate('validation.companyNameRequired')),
    supplierId: z.string().min(1, translate('validation.supplierIdRequired')),
    shippingProvider:
      currentStep === 1
        ? z
            .enum(SELLER_INVITE_SHIPPING_PROVIDER_VALUES)
            .optional()
            .refine(
              (value): value is ShippingProvider =>
                value !== undefined &&
                SELLER_INVITE_SHIPPING_PROVIDER_VALUES.includes(value),
              {
                message: translate('validation.shippingProviderRequired'),
              },
            )
        : z.enum(SELLER_INVITE_SHIPPING_PROVIDER_VALUES).optional(),
    businessRegistrationId:
      currentStep === 2
        ? z.string().min(1, translate('validation.businessIdRequired'))
        : z.string().optional(),
    businessRegistrationCertificate:
      currentStep === 2
        ? z
            .custom<File>()
            .refine((file) => file !== null && file !== undefined, {
              message: translate('validation.businessCertificateRequired'),
            })
            .refine((file) => file && file.size <= MAX_FILE_SIZE, {
              message: translate('validation.fileSizeError'),
            })
            .refine(
              (file) =>
                file &&
                ACCEPTED_FILE_TYPES.some(
                  (type) => file.type === type || file.type.startsWith(type),
                ),
              {
                message: translate('validation.fileTypeError'),
              },
            )
        : z.custom<File>().optional(),
  });
};

type FormData = z.infer<ReturnType<typeof getFormSchema>>;

interface InviteSellerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onInvite: (
    email: string,
    companyName: string,
    supplierId: string,
    shippingProvider: ShippingProvider,
    businessRegistrationId: string,
    businessRegistrationCertificate: File,
  ) => void;
  isLoading?: boolean;
}

export function InviteSellerDialog({
  isOpen,
  onClose,
  onInvite,
  isLoading = false,
}: Readonly<InviteSellerDialogProps>) {
  const { translate } = useLocalization('inviteSellerDialog');
  const [step, setStep] = useState(1);

  const formSchema = useMemo(
    () => getFormSchema(step, translate),
    [step, translate],
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
  });

  const businessRegistrationCertificate = watch(
    'businessRegistrationCertificate',
  );
  const shippingProvider = watch('shippingProvider');

  // Clear businessRegistrationId field when moving to step 2
  useEffect(() => {
    if (step === 2) {
      setValue('businessRegistrationId', '', { shouldValidate: false });
      setValue('businessRegistrationCertificate', undefined, {
        shouldValidate: false,
      });
    }
  }, [step, setValue]);

  const handleFileChange = (file: File | null) => {
    setValue('businessRegistrationCertificate', file ?? undefined, {
      shouldValidate: true,
    });
  };

  const onSubmit = (data: FormData) => {
    if (step === 1) {
      setStep(2);
    } else if (data.businessRegistrationCertificate && data.shippingProvider) {
      onInvite(
        data.email,
        data.companyName,
        data.supplierId,
        data.shippingProvider,
        data.businessRegistrationId ?? '',
        data.businessRegistrationCertificate,
      );
      handleClose();
    }
  };

  const handleClose = () => {
    reset();
    setStep(1);
    onClose();
  };

  return (
    <BaseDialog
      isOpen={isOpen}
      onClose={handleClose}
      onSubmit={handleSubmit(onSubmit)}
      isLoading={isLoading}
      title={translate('title')}
      description={translate('description')}
      submitButtonText={
        step === 1
          ? translate('actions.continue')
          : translate('actions.sendInvite')
      }
    >
      {step === 1 ? (
        <>
          <InputField
            label={translate('fields.email')}
            placeholder={translate('fields.emailPlaceholder')}
            required
            {...register('email')}
            error={errors.email?.message}
            type="email"
          />

          <InputField
            label={translate('fields.companyName')}
            placeholder={translate('fields.companyNamePlaceholder')}
            required
            {...register('companyName')}
            error={errors.companyName?.message}
            type="text"
          />

          <InputField
            label={translate('fields.supplierId')}
            placeholder={translate('fields.supplierIdPlaceholder')}
            required
            {...register('supplierId')}
            error={errors.supplierId?.message}
            type="text"
          />

          <InputDropdown
            label={translate('fields.shippingProvider')}
            placeholder={translate('fields.shippingProviderPlaceholder')}
            options={[...SELLER_INVITE_SHIPPING_PROVIDERS]}
            value={shippingProvider ?? ''}
            onChange={(value) => {
              if (
                value === ShippingProvider.SELF_MANAGED ||
                value === ShippingProvider.SHIP_TO_MERIT ||
                value === ShippingProvider.MERIT_LOGISTICS
              ) {
                setValue('shippingProvider', value, { shouldValidate: true });
              }
            }}
            error={errors.shippingProvider?.message}
            required
          />
        </>
      ) : (
        <>
          <InputField
            label={translate('fields.businessId')}
            placeholder={translate('fields.businessIdPlaceholder')}
            required
            {...register('businessRegistrationId')}
            error={errors.businessRegistrationId?.message}
            type="text"
          />

          <FileUpload
            label={translate('fields.uploadBusinessCertificate')}
            file={businessRegistrationCertificate}
            onFileChange={handleFileChange}
            error={errors.businessRegistrationCertificate?.message}
            accept=".pdf,image/*"
            required
            uploadText={translate('fields.clickToUpload')}
            dragDropText={translate('fields.dragAndDrop')}
            requirementsText={translate('fields.fileRequirements')}
            fileCompleteText={translate('fields.fileComplete')}
          />
        </>
      )}
    </BaseDialog>
  );
}
