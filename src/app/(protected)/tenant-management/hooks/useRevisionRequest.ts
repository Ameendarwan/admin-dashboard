import { useEffect, useRef, useState } from 'react';

import { ReviewMode } from '@/lib/enums';
import type { RevisionFieldCallbacks } from '@/types/review';

type UseRevisionRequestParams = {
  fieldPath: string;
  mode: ReviewMode;
  onRevisionRequest: RevisionFieldCallbacks['onRevisionRequest'];
  onRevisionClear: RevisionFieldCallbacks['onRevisionClear'];
};

export function useRevisionRequest({
  fieldPath,
  mode,
  onRevisionRequest,
  onRevisionClear,
}: UseRevisionRequestParams) {
  const [isRevisionRequested, setIsRevisionRequested] = useState(false);
  const [revisionReason, setRevisionReason] = useState('');
  const prevModeRef = useRef(mode);

  useEffect(() => {
    const wasRevision = prevModeRef.current === ReviewMode.REVISION;
    const isRevision = mode === ReviewMode.REVISION;
    if (wasRevision && !isRevision) {
      setIsRevisionRequested(false);
      setRevisionReason('');
      onRevisionClear(fieldPath);
    }
    prevModeRef.current = mode;
  }, [mode, fieldPath, onRevisionClear]);

  const handleRevisionChange = (checked: boolean) => {
    setIsRevisionRequested(checked);
    if (!checked) {
      setRevisionReason('');
      onRevisionClear(fieldPath);
    }
  };

  const handleReasonChange = (reason: string) => {
    setRevisionReason(reason);
    if (reason.trim()) {
      onRevisionRequest(fieldPath, reason);
    }
  };

  return {
    isRevisionRequested,
    revisionReason,
    handleRevisionChange,
    handleReasonChange,
  };
}
