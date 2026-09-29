'use client';

import { Download, CheckCircle, Reply, Truck, Clock } from 'lucide-react';
import { Button } from '@merit-incentives/ui';

import type { Direction } from '@/hooks/useLocalization';

import type { SplAwbPopupStatus } from '../../../SplAwbStatusPopup';
import type { HeaderUiModel, TranslateFn } from '../../deriveHeaderUiModel';
import { OrderDetailStmHelperTexts } from '../OrderDetailStmHelperTexts';

const REJECT_QC_BUTTON_CLASS =
  'w-fit min-w-0 !px-4.5 border-2 border-red-600 bg-white text-red-600 hover:bg-red-50';

/** View Proof: flat white, gray border, pill shape — no shadow (matches design). */
const VIEW_PROOF_BUTTON_CLASS =
  'w-fit min-w-0 !px-4.5 rounded-full border border-mds-gray-300 bg-white text-mds-gray-900 !shadow-none hover:bg-mds-gray-50';

interface OrderDetailHeaderActionsProps {
  model: HeaderUiModel;
  dir: Direction;
  isRejectingQc: boolean;
  isMarkingReceived: boolean;
  isRequestingAwb: boolean;
  onMarkAsReceived?: () => void;
  onViewSellerProof?: () => void;
  onViewQcProof?: () => void;
  onDownloadAwb?: () => void;
  openRejectQc: () => void;
  openRequestAwb: () => void;
  openSplAwbPopup: (next: SplAwbPopupStatus) => void;
  translate: TranslateFn;
}

export function OrderDetailHeaderActions({
  model,
  dir,
  isRejectingQc,
  isMarkingReceived,
  isRequestingAwb,
  onMarkAsReceived,
  onViewSellerProof,
  onViewQcProof,
  onDownloadAwb,
  openRejectQc,
  openRequestAwb,
  openSplAwbPopup,
  translate,
}: Readonly<OrderDetailHeaderActionsProps>) {
  return (
    <div className="flex min-w-0 flex-col items-stretch gap-2 pt-10 sm:items-end sm:pt-12">
      <div className="flex flex-wrap items-center justify-end gap-3">
        {model.showSellerProofButton ? (
          <Button
            type="button"
            variant="secondary"
            size="md"
            leftIcon={<Download className="h-4 w-4" aria-hidden />}
            className={VIEW_PROOF_BUTTON_CLASS}
            onClick={onViewSellerProof}
          >
            {translate('actions.viewSellerProof')}
          </Button>
        ) : null}

        {model.showStmPendingActions ? (
          <>
            <Button
              type="button"
              variant="tertiary"
              size="md"
              leftIcon={<Reply className="h-4 w-4 text-red-600" aria-hidden />}
              className={REJECT_QC_BUTTON_CLASS}
              onClick={openRejectQc}
              disabled={isRejectingQc}
            >
              {isRejectingQc ? '...' : translate('actions.rejectQc')}
            </Button>
            <Button
              type="button"
              variant="primary"
              size="md"
              leftIcon={<CheckCircle className="h-4 w-4" aria-hidden />}
              onClick={onMarkAsReceived}
              disabled={isMarkingReceived}
            >
              {isMarkingReceived ? '...' : translate('actions.markAsReceived')}
            </Button>
          </>
        ) : null}

        {model.showStmCompleteActions ? (
          <Button
            type="button"
            variant="primary"
            size="md"
            leftIcon={<Truck className="h-4 w-4" aria-hidden />}
            onClick={openRequestAwb}
            disabled={isRequestingAwb}
          >
            {isRequestingAwb ? '...' : translate('actions.requestAwbAndShip')}
          </Button>
        ) : null}

        {model.showReturnQcProofButton ? (
          <Button
            type="button"
            variant="secondary"
            size="md"
            leftIcon={<Download className="h-4 w-4" aria-hidden />}
            className={VIEW_PROOF_BUTTON_CLASS}
            onClick={onViewQcProof}
          >
            {translate('actions.viewRejectedProof')}
          </Button>
        ) : null}

        {model.splGeneratingButton ? (
          <Button
            type="button"
            variant="secondary"
            size="md"
            leftIcon={<Clock className="h-4 w-4" aria-hidden />}
            onClick={() => openSplAwbPopup('generating')}
          >
            {translate('actions.viewAwbStatus')}
          </Button>
        ) : null}

        {model.splReadyDownloadRts ? (
          <Button
            type="button"
            variant="primary"
            size="md"
            leftIcon={<Download className="h-4 w-4" aria-hidden />}
            onClick={() => openSplAwbPopup('ready-download')}
          >
            {translate('actions.awbReadyButton')}
          </Button>
        ) : null}

        {model.splDownloadShippedOrDelivered ? (
          <Button
            type="button"
            variant="secondary"
            size="md"
            leftIcon={<Download className="h-4 w-4" aria-hidden />}
            onClick={() => openSplAwbPopup('ready-download')}
          >
            {translate('actions.downloadAwb')}
          </Button>
        ) : null}

        {model.showSelfManagedAwbDownload ? (
          <Button
            type="button"
            variant="secondary"
            size="md"
            leftIcon={<Download className="h-4 w-4" aria-hidden />}
            onClick={() => onDownloadAwb?.()}
          >
            {translate('actions.downloadAwb')}
          </Button>
        ) : null}
      </div>

      <OrderDetailStmHelperTexts
        pending={model.stmPendingHelperText}
        complete={model.stmCompleteHelperText}
        dir={dir}
      />
    </div>
  );
}
