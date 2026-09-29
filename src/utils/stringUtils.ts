export function trimOrEmpty(value: string | null | undefined): string {
  return value?.trim() ?? '';
}

export function toTitleCaseWords(value: string, splitRegex: RegExp): string {
  const trimmed = value.trim();
  if (!trimmed) return '';
  return trimmed
    .split(splitRegex)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

export function formatAttachmentTypeLabel(apiAttachmentType: string): string {
  return toTitleCaseWords(apiAttachmentType, /[-_\s]+/);
}

/** Basic email shape check without regex backtracking. */
export function isValidEmail(value: string): boolean {
  const email = value.trim();
  const at = email.indexOf('@');
  if (at <= 0 || at !== email.lastIndexOf('@')) {
    return false;
  }
  const local = email.slice(0, at);
  const domain = email.slice(at + 1);
  if (!local || !domain || local.includes(' ') || domain.includes(' ')) {
    return false;
  }
  const dot = domain.lastIndexOf('.');
  return dot > 0 && dot < domain.length - 1;
}
