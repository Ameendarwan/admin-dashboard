import * as z from 'zod';

export type EditTenantFormValues = {
  businessName: string;
  country: string;
  accountManager: string;
};

export function createEditTenantFormSchema(translate: (key: string) => string) {
  return z.object({
    businessName: z
      .string()
      .min(1, translate('editDialog.validation.businessNameRequired')),
    country: z.string(),
    accountManager: z.string(),
  });
}
