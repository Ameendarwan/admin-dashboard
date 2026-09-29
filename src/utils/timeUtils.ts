/**
 * Convert minutes to milliseconds.
 */
export const minutesToMs = (minutes: number): number => minutes * 60 * 1000;

/** 10 minutes in milliseconds - use for gcTime, staleTime, or any time-based config */
export const TIME_10_MIN = minutesToMs(10);

/** 30 minutes in milliseconds - use for gcTime, staleTime, or any time-based config */
export const TIME_30_MIN = minutesToMs(30);

/** 5 minutes in milliseconds - use for gcTime, staleTime, or any time-based config */
export const TIME_5_MIN = minutesToMs(5);