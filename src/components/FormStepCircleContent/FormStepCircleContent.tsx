import { Check } from 'lucide-react';
import type { ReactNode } from 'react';

export function getFormStepCircleContent(
  isComplete: boolean,
  isActive: boolean,
): ReactNode {
  if (isComplete) {
    return (
      <Check className="h-5 w-5 text-white" strokeWidth={2.75} aria-hidden />
    );
  }

  if (isActive) {
    return <span className="h-2.5 w-2.5 rounded-full bg-mds-primary-600" />;
  }

  return <span className="h-2 w-2 rounded-full bg-mds-black-300" />;
}
