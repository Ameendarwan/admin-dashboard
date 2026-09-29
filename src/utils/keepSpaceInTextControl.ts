import type { KeyboardEvent } from 'react';

/** Space is captured by parent handlers (e.g. stepper); keep it in the focused control. */
export function keepSpaceInTextControl(
  e: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>,
) {
  if (e.key === ' ') {
    e.stopPropagation();
  }
}
