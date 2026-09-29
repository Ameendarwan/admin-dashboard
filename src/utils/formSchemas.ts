import * as z from 'zod';

export const createUserFormSchema = (translate: (key: string) => string) => {
  return z.object({
    fullName: z.string().min(1, translate('validation.fullNameRequired')),
    email: z.string().email(translate('validation.emailInvalid')),
    domain: z.string().min(1, translate('validation.domainRequired')),
    role: z.string().min(1, translate('validation.roleRequired')),
  });
};

export const createEditUserFormSchema = (
  translate: (key: string) => string,
) => {
  return createUserFormSchema(translate).extend({
    status: z.string().min(1, translate('validation.statusRequired')),
  });
};
