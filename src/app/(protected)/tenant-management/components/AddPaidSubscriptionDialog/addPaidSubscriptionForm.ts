import * as z from 'zod';
import type { ZodError } from 'zod';

export type BillingFrequency = 'yearly' | 'months';

export type AddPaidSubscriptionFormValues = {
  productId: string;
  enableFreeTrial: boolean;
  trialDays: number;
  startDate: string;
  endDate: string;
  gracePeriodDays: number;
  currency: string;
  agreedPrice: string;
  billingFrequency: BillingFrequency;
  /** Billing interval in months when `billingFrequency` is `months`. */
  billingMonths: number;
};

export const DEFAULT_TRIAL_DAYS = 14;

/** Maximum free-trial length for admin enterprise subscriptions. */
export const MAX_ENTERPRISE_TRIAL_DAYS = 90;

/** Minimum contract length (start → end) in calendar days. */
export const MIN_SUBSCRIPTION_PERIOD_DAYS = 7;

/** Minimum paid days between trial end and subscription end when trial is enabled. */
export const MIN_POST_TRIAL_DAYS = 7;

/** Warn when trial consumes more than this share of the contract window. */
export const MAX_TRIAL_SHARE_OF_PERIOD = 0.8;

/** Warn when the subscription period exceeds this many calendar days. */
export const MAX_SUBSCRIPTION_PERIOD_DAYS = 365;

/** Subscriptions are billed in SAR only until multi-currency is supported. */
export const SUBSCRIPTION_CURRENCY = 'SAR' as const;

export const DEFAULT_ADD_PAID_SUBSCRIPTION_VALUES: AddPaidSubscriptionFormValues =
  {
    productId: '',
    enableFreeTrial: false,
    trialDays: DEFAULT_TRIAL_DAYS,
    startDate: '',
    endDate: '',
    gracePeriodDays: 14,
    currency: SUBSCRIPTION_CURRENCY,
    agreedPrice: '',
    billingFrequency: 'months',
    billingMonths: 18,
  };

export function isFreeTrialSubscriptionValues(
  values: Pick<AddPaidSubscriptionFormValues, 'enableFreeTrial' | 'trialDays'>,
): boolean {
  return values.enableFreeTrial && values.trialDays >= 1;
}

/** Free-trial subscriptions end on start + trial length (admin simplified flow). */
export function resolveSubscriptionEndDate(
  values: Pick<
    AddPaidSubscriptionFormValues,
    'enableFreeTrial' | 'trialDays' | 'startDate' | 'endDate'
  >,
): string {
  if (isFreeTrialSubscriptionValues(values) && values.startDate) {
    return addCalendarDays(values.startDate, values.trialDays);
  }
  return values.endDate;
}

/** Parses agreed price when provided; returns undefined for empty trial optional field. */
export function parseOptionalAgreedPrice(
  agreedPrice: string,
): number | undefined {
  const trimmed = agreedPrice.trim();
  if (!trimmed) {
    return undefined;
  }
  const amount = Number(trimmed);
  if (!Number.isFinite(amount) || amount <= 0) {
    return undefined;
  }
  return amount;
}

/** Today as `YYYY-MM-DD` in UTC (matches date input values). */
export function getTodayUtcIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Adds calendar days to an ISO date string (same semantics as payment `addDays`). */
export function addCalendarDays(isoDate: string, days: number): string {
  const parsed = Date.parse(`${isoDate}T00:00:00.000Z`);
  if (!Number.isFinite(parsed)) {
    return '';
  }
  const next = new Date(parsed);
  next.setUTCDate(next.getUTCDate() + days);
  return next.toISOString().slice(0, 10);
}

export function getSubscriptionPeriodDays(
  startDate: string,
  endDate: string,
): number | null {
  return calendarDaysBetweenStartAndEnd(startDate, endDate);
}

/** First day of the grace window: last N days before subscription end (within the contract). */
export function getGracePeriodStartDate(
  endDate: string,
  gracePeriodDays: number,
): string {
  return addCalendarDays(endDate, -gracePeriodDays);
}

export function getPostTrialDays(
  values: Pick<
    AddPaidSubscriptionFormValues,
    'enableFreeTrial' | 'trialDays' | 'startDate' | 'endDate'
  >,
): number | null {
  if (!values.enableFreeTrial || !values.startDate || !values.endDate) {
    return null;
  }
  const periodDays = calendarDaysBetweenStartAndEnd(
    values.startDate,
    values.endDate,
  );
  if (periodDays === null || periodDays <= values.trialDays) {
    return null;
  }
  return periodDays - values.trialDays;
}

/** Paid days after trial and before the grace window starts. */
export function getPaidDaysBeforeGrace(
  values: Pick<
    AddPaidSubscriptionFormValues,
    | 'enableFreeTrial'
    | 'trialDays'
    | 'startDate'
    | 'endDate'
    | 'gracePeriodDays'
  >,
): number | null {
  if (!values.enableFreeTrial || !values.startDate || !values.endDate) {
    return null;
  }

  const trialEndsAt = addCalendarDays(values.startDate, values.trialDays);
  const graceStartsAt = getGracePeriodStartDate(
    values.endDate,
    values.gracePeriodDays,
  );
  if (!trialEndsAt || !graceStartsAt) {
    return null;
  }

  if (trialEndsAt > graceStartsAt) {
    return 0;
  }

  return calendarDaysBetweenStartAndEnd(trialEndsAt, graceStartsAt);
}

export function doesTrialOverlapGracePeriod(
  values: Pick<
    AddPaidSubscriptionFormValues,
    | 'enableFreeTrial'
    | 'trialDays'
    | 'startDate'
    | 'endDate'
    | 'gracePeriodDays'
  >,
): boolean {
  if (!values.enableFreeTrial || !values.startDate || !values.endDate) {
    return false;
  }

  const trialEndsAt = addCalendarDays(values.startDate, values.trialDays);
  const graceStartsAt = getGracePeriodStartDate(
    values.endDate,
    values.gracePeriodDays,
  );
  return Boolean(trialEndsAt && graceStartsAt && trialEndsAt > graceStartsAt);
}

export type SubscriptionAccessTimeline = {
  trialEndsAt?: string;
  graceStartsAt: string;
  subscriptionEndsAt: string;
};

export function buildSubscriptionAccessTimeline(
  values: Pick<
    AddPaidSubscriptionFormValues,
    | 'startDate'
    | 'endDate'
    | 'gracePeriodDays'
    | 'enableFreeTrial'
    | 'trialDays'
  >,
): SubscriptionAccessTimeline | null {
  if (!values.startDate || !values.endDate) {
    return null;
  }

  return {
    trialEndsAt:
      values.enableFreeTrial && values.trialDays >= 1
        ? addCalendarDays(values.startDate, values.trialDays)
        : undefined,
    graceStartsAt: getGracePeriodStartDate(
      values.endDate,
      values.gracePeriodDays,
    ),
    subscriptionEndsAt: values.endDate,
  };
}

/** UTC calendar-day difference (end − start), matching payment `addDays(start, n)`. */
export function calendarDaysBetweenStartAndEnd(
  startDate: string,
  endDate: string,
): number | null {
  if (!startDate || !endDate) {
    return null;
  }
  const start = Date.parse(`${startDate}T00:00:00.000Z`);
  const end = Date.parse(`${endDate}T00:00:00.000Z`);
  if (!Number.isFinite(start) || !Number.isFinite(end)) {
    return null;
  }
  return Math.round((end - start) / 86_400_000);
}

/**
 * Trial ends at start + trialDays (same as payment-service).
 * Requires subscription window strictly longer than trial and trial end on/before end date.
 */
export function validateFreeTrialAgainstSubscriptionPeriod(
  input: Pick<
    AddPaidSubscriptionFormValues,
    'enableFreeTrial' | 'trialDays' | 'startDate' | 'endDate'
  >,
):
  | 'ok'
  | 'trialDaysInvalid'
  | 'trialDaysExceedsMax'
  | 'trialExceedsPeriod'
  | 'trialEndsAfterSubscriptionEnd'
  | 'datesRequired' {
  if (!input.enableFreeTrial) {
    return 'ok';
  }

  if (!input.startDate || !input.endDate) {
    return 'datesRequired';
  }

  if (!Number.isInteger(input.trialDays) || input.trialDays < 1) {
    return 'trialDaysInvalid';
  }

  if (input.trialDays > MAX_ENTERPRISE_TRIAL_DAYS) {
    return 'trialDaysExceedsMax';
  }

  const periodDays = calendarDaysBetweenStartAndEnd(
    input.startDate,
    input.endDate,
  );
  if (periodDays === null || periodDays < 0) {
    return 'datesRequired';
  }

  if (periodDays <= input.trialDays) {
    return 'trialExceedsPeriod';
  }

  const trialEndsAt = addCalendarDays(input.startDate, input.trialDays);
  if (trialEndsAt && input.endDate < trialEndsAt) {
    return 'trialEndsAfterSubscriptionEnd';
  }

  return 'ok';
}

function applyDetailsStepCrossFieldValidation(
  data: Pick<
    AddPaidSubscriptionFormValues,
    | 'enableFreeTrial'
    | 'trialDays'
    | 'startDate'
    | 'endDate'
    | 'gracePeriodDays'
  >,
  ctx: z.RefinementCtx,
  translate: (key: string, values?: Record<string, string | number>) => string,
): void {
  if (data.startDate && data.startDate < getTodayUtcIsoDate()) {
    ctx.addIssue({
      code: 'custom',
      message: translate('validation.startDateNotInPast'),
      path: ['startDate'],
    });
  }

  const endDate = resolveSubscriptionEndDate(data);
  if (!data.startDate || !endDate) {
    return;
  }

  const periodDays = calendarDaysBetweenStartAndEnd(data.startDate, endDate);
  if (periodDays === null) {
    return;
  }

  if (periodDays < MIN_SUBSCRIPTION_PERIOD_DAYS) {
    ctx.addIssue({
      code: 'custom',
      message: translate('validation.subscriptionPeriodTooShort', {
        minDays: MIN_SUBSCRIPTION_PERIOD_DAYS,
        periodDays,
      }),
      path: ['endDate'],
    });
  }

  if (data.gracePeriodDays > periodDays) {
    ctx.addIssue({
      code: 'custom',
      message: translate('validation.graceExceedsPeriod', {
        graceDays: data.gracePeriodDays,
        periodDays,
      }),
      path: ['gracePeriodDays'],
    });
    return;
  }

  const graceStartsAt = getGracePeriodStartDate(endDate, data.gracePeriodDays);
  if (graceStartsAt < data.startDate) {
    ctx.addIssue({
      code: 'custom',
      message: translate('validation.graceExceedsPeriod', {
        graceDays: data.gracePeriodDays,
        periodDays,
      }),
      path: ['gracePeriodDays'],
    });
    return;
  }

  if (!data.enableFreeTrial) {
    return;
  }

  if (!Number.isInteger(data.trialDays) || data.trialDays < 1) {
    ctx.addIssue({
      code: 'custom',
      message: translate('validation.trialDaysInvalid', {
        maxDays: MAX_ENTERPRISE_TRIAL_DAYS,
      }),
      path: ['trialDays'],
    });
    return;
  }

  if (data.trialDays > MAX_ENTERPRISE_TRIAL_DAYS) {
    ctx.addIssue({
      code: 'custom',
      message: translate('validation.trialDaysExceedsMax', {
        maxDays: MAX_ENTERPRISE_TRIAL_DAYS,
      }),
      path: ['trialDays'],
    });
  }
}

export function mapZodErrorToFieldErrors<T extends string>(
  error: ZodError,
): Partial<Record<T, string>> {
  const mapped: Partial<Record<T, string>> = {};
  for (const issue of error.issues) {
    const field = issue.path[0];
    if (typeof field !== 'string') {
      continue;
    }
    const key = field as T;
    if (!mapped[key]) {
      mapped[key] = issue.message;
    }
  }
  return mapped;
}

export function getDetailsStepFieldErrors(
  values: AddPaidSubscriptionFormValues,
  translate: (key: string, values?: Record<string, string | number>) => string,
): Partial<Record<keyof AddPaidSubscriptionFormValues, string>> {
  const result = createDetailsStepSchema(translate).safeParse(values);
  if (result.success) {
    return {};
  }
  return mapZodErrorToFieldErrors<keyof AddPaidSubscriptionFormValues>(
    result.error,
  );
}

export function getBillingStepFieldErrors(
  values: AddPaidSubscriptionFormValues,
  translate: (key: string, values?: Record<string, string | number>) => string,
  isFreeTrial: boolean,
): Partial<Record<keyof AddPaidSubscriptionFormValues, string>> {
  const result = createBillingStepSchema(translate, { isFreeTrial }).safeParse(
    values,
  );
  if (result.success) {
    return {};
  }
  return mapZodErrorToFieldErrors<keyof AddPaidSubscriptionFormValues>(
    result.error,
  );
}

export type SubscriptionFieldFeedback = {
  error?: string;
  warning?: string;
};

/** Inline warnings for details step (shown next to fields, not at form top). */
export function getDetailsStepWarnings(
  values: AddPaidSubscriptionFormValues,
  translate: (key: string, values?: Record<string, string | number>) => string,
): Partial<Record<keyof AddPaidSubscriptionFormValues, string>> {
  const warnings: Partial<Record<keyof AddPaidSubscriptionFormValues, string>> =
    {};

  const endDate = resolveSubscriptionEndDate(values);

  if (!values.startDate || !endDate) {
    if (
      values.enableFreeTrial &&
      values.trialDays > MAX_ENTERPRISE_TRIAL_DAYS
    ) {
      warnings.trialDays = translate('validation.trialDaysExceedsMaxWarning', {
        maxDays: MAX_ENTERPRISE_TRIAL_DAYS,
        trialDays: values.trialDays,
      });
    }
    return warnings;
  }

  const periodDays =
    calendarDaysBetweenStartAndEnd(values.startDate, endDate) ?? 0;

  if (values.gracePeriodDays > periodDays) {
    warnings.gracePeriodDays = translate(
      'validation.graceExceedsPeriodWarning',
      {
        graceDays: values.gracePeriodDays,
        periodDays,
      },
    );
  } else if (periodDays > MAX_SUBSCRIPTION_PERIOD_DAYS) {
    warnings.endDate = translate(
      'validation.subscriptionPeriodExceedsMaxWarning',
      {
        periodDays,
        maxDays: MAX_SUBSCRIPTION_PERIOD_DAYS,
      },
    );
  }

  if (values.enableFreeTrial) {
    if (values.trialDays > MAX_ENTERPRISE_TRIAL_DAYS) {
      warnings.trialDays = translate('validation.trialDaysExceedsMaxWarning', {
        maxDays: MAX_ENTERPRISE_TRIAL_DAYS,
        trialDays: values.trialDays,
      });
    }
    return warnings;
  }

  return warnings;
}

/** Warnings stay visible before submit; after submit attempt errors take precedence. */
export function resolveLiveFieldFeedback(
  field: keyof AddPaidSubscriptionFormValues,
  errors: Partial<Record<keyof AddPaidSubscriptionFormValues, string>>,
  warnings: Partial<Record<keyof AddPaidSubscriptionFormValues, string>>,
  options: { showErrors: boolean; showWarnings: boolean },
): SubscriptionFieldFeedback {
  if (options.showErrors && errors[field]) {
    return { error: errors[field] };
  }
  if (options.showWarnings && warnings[field]) {
    return { warning: warnings[field] };
  }
  return {};
}

export const DETAILS_STEP_FIELDS: (keyof AddPaidSubscriptionFormValues)[] = [
  'productId',
  'enableFreeTrial',
  'trialDays',
  'startDate',
  'endDate',
  'gracePeriodDays',
];

export const BILLING_STEP_FIELDS: (keyof AddPaidSubscriptionFormValues)[] = [
  'agreedPrice',
  'billingFrequency',
  'billingMonths',
];

export function createDetailsStepSchema(
  translate: (key: string, values?: Record<string, string | number>) => string,
) {
  return z
    .object({
      productId: z.string().min(1, translate('validation.productRequired')),
      enableFreeTrial: z.boolean(),
      trialDays: z.coerce.number(),
      startDate: z.string().min(1, translate('validation.startDateRequired')),
      endDate: z.string(),
      gracePeriodDays: z.coerce
        .number()
        .int(translate('validation.gracePeriodInteger'))
        .min(1, translate('validation.gracePeriodMin'))
        .max(365, translate('validation.gracePeriodMax')),
    })
    .refine((data) => Boolean(resolveSubscriptionEndDate(data)), {
      message: translate('validation.endDateRequired'),
      path: ['endDate'],
    })
    .refine(
      (data) => {
        const endDate = resolveSubscriptionEndDate(data);
        return !data.startDate || !endDate || endDate >= data.startDate;
      },
      {
        message: translate('validation.endDateAfterStart'),
        path: ['endDate'],
      },
    )
    .superRefine((data, ctx) => {
      applyDetailsStepCrossFieldValidation(data, ctx, translate);
    });
}

export function createBillingStepSchema(
  translate: (key: string, values?: Record<string, string | number>) => string,
  options: { isFreeTrial: boolean },
) {
  return z
    .object({
      agreedPrice: options.isFreeTrial
        ? z.string().refine((value) => {
            const trimmed = value.trim();
            if (!trimmed) {
              return true;
            }
            const parsed = Number(trimmed);
            return Number.isFinite(parsed) && parsed > 0;
          }, translate('validation.agreedPricePositive'))
        : z
            .string()
            .min(1, translate('validation.agreedPriceRequired'))
            .refine((value) => {
              const parsed = Number(value);
              return Number.isFinite(parsed) && parsed > 0;
            }, translate('validation.agreedPricePositive')),
      billingFrequency: z.enum(['yearly', 'months']),
      billingMonths: z.coerce.number(),
    })
    .superRefine((data, ctx) => {
      if (data.billingFrequency !== 'months') {
        return;
      }
      if (!Number.isFinite(data.billingMonths) || data.billingMonths < 1) {
        ctx.addIssue({
          code: 'custom',
          message: translate('validation.billingMonthsPositive'),
          path: ['billingMonths'],
        });
      }
    });
}

export function formatSubscriptionDisplayDate(isoDate: string): string {
  if (!isoDate) return '';
  const [year, month, day] = isoDate.split('-');
  if (!year || !month || !day) return isoDate;
  return `${day}/${month}/${year}`;
}

export function formatAgreedPriceWithCurrency(
  agreedPrice: string,
  currency: string = SUBSCRIPTION_CURRENCY,
): string {
  const trimmed = agreedPrice.trim();
  if (!trimmed) return currency;
  return `${trimmed} ${currency}`;
}

export function formatBillingFrequencyLabel(
  values: Pick<
    AddPaidSubscriptionFormValues,
    'billingFrequency' | 'billingMonths'
  >,
  translate: (key: string, params?: Record<string, string | number>) => string,
): string {
  if (values.billingFrequency === 'yearly') {
    return translate('review.billingFrequencyYearly');
  }
  return translate('review.billingFrequencyMonths', {
    count: values.billingMonths,
  });
}
