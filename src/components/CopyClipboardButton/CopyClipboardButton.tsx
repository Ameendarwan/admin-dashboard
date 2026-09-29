'use client';

import { Copy } from 'lucide-react';
import { useState, type MouseEvent } from 'react';

export interface CopyClipboardButtonProps {
  /** Text written to the clipboard (not trimmed). */
  textToCopy: string;
  ariaLabel: string;
  /** Tooltip when idle (not yet copied). */
  title: string;
  /** Tooltip after successful copy. */
  copiedTitle?: string;
  /** When true, renders nothing if `textToCopy` is empty. */
  hideIfEmpty?: boolean;
  disabled?: boolean;
}

export function CopyClipboardButton({
  textToCopy,
  ariaLabel,
  title,
  copiedTitle = 'Copied!',
  hideIfEmpty = false,
  disabled = false,
}: Readonly<CopyClipboardButtonProps>) {
  const [copied, setCopied] = useState(false);

  if (hideIfEmpty && textToCopy === '') {
    return null;
  }

  const isDisabled = disabled || textToCopy === '';

  const handleClick = async (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (isDisabled) return;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isDisabled}
      className="p-1.5 rounded-md hover:bg-mds-gray-100 transition-colors cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
      aria-label={ariaLabel}
      title={copied ? copiedTitle : title}
    >
      <Copy
        className={`w-4 h-4 ${copied ? 'text-mds-success-500' : 'text-mds-gray-500'}`}
      />
    </button>
  );
}
