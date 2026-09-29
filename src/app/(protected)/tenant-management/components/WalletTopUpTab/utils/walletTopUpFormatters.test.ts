/// <reference types="jest" />

import {
  formatTopUpDetailsDate,
  formatTopUpProofFileSize,
  formatWalletAmountMinor,
} from './walletTopUpFormatters';

describe('formatWalletAmountMinor', () => {
  it('groups thousands without changing small amounts', () => {
    expect(formatWalletAmountMinor('1', 2)).toBe('0.01');
    expect(formatWalletAmountMinor('123', 2)).toBe('1.23');
    expect(formatWalletAmountMinor('1234', 2)).toBe('12.34');
  });

  it('inserts commas from the right for large whole amounts', () => {
    expect(formatWalletAmountMinor('1234567', 2)).toBe('12,345.67');
    expect(formatWalletAmountMinor('100000000', 2)).toBe('1,000,000.00');
    expect(formatWalletAmountMinor('1234', 0)).toBe('1,234');
  });

  it('keeps a leading minus on grouped values', () => {
    expect(formatWalletAmountMinor('-1234567', 2)).toBe('-12,345.67');
  });
});

describe('formatTopUpDetailsDate', () => {
  it('returns a dash for missing or invalid dates', () => {
    expect(formatTopUpDetailsDate(null)).toBe('-');
    expect(formatTopUpDetailsDate(undefined)).toBe('-');
    expect(formatTopUpDetailsDate('')).toBe('-');
    expect(formatTopUpDetailsDate('not-a-date')).toBe('-');
  });

  it('formats a local ISO timestamp as dd/MM/yyyy - time', () => {
    expect(formatTopUpDetailsDate('2026-06-26T09:27:00', 'en')).toMatch(
      /^26\/06\/2026 - /,
    );
  });
});

describe('formatTopUpProofFileSize', () => {
  it('returns null for empty values', () => {
    expect(formatTopUpProofFileSize(null)).toBeNull();
    expect(formatTopUpProofFileSize('')).toBeNull();
  });

  it('keeps already-labeled sizes and formats raw bytes', () => {
    expect(formatTopUpProofFileSize('2.35 MB')).toBe('2.35 MB');
    expect(formatTopUpProofFileSize(1024)).toBe('1.00 KB');
    expect(formatTopUpProofFileSize(2.35 * 1024 * 1024)).toBe('2.35 MB');
  });
});
