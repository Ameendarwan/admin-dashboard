import { EMAIL_REGEX } from '@/constants/regex';

export const validateEmail = (
  email: string,
  translate: (key: string) => string,
): string | undefined => {
  if (!email.trim()) {
    return translate('validation.emailRequired');
  }
  if (!EMAIL_REGEX.test(email)) {
    return translate('validation.emailInvalid');
  }
  return undefined;
};

export const validateRequiredField = (
  value: string,
  translate: (key: string) => string,
  validationKey: string,
): string | undefined => {
  if (!value.trim()) {
    return translate(validationKey);
  }
  return undefined;
};

export const createInputChangeHandler = <T extends Record<string, unknown>>(
  setter: React.Dispatch<React.SetStateAction<string>>,
  setErrors: React.Dispatch<React.SetStateAction<T>>,
  errorKey: keyof T,
) => {
  return (e: React.ChangeEvent<HTMLInputElement>) => {
    setter(e.target.value);
    setErrors((prev) => ({ ...prev, [errorKey]: undefined }));
  };
};
