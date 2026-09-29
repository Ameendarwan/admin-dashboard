import {
  OrderStatus,
  ShippingProvider,
  SHIP_TO_MERIT_DETAIL_LABELS,
} from '@/lib/enums';
import {
  getOrderHeaderStatusLabel,
  getOrderStatusBadgeColor,
  getShipToMeritDetailBadgeColor,
  isShipToMeritShipping,
  isShipToMeritStatus,
} from '@/utils/orderDetailStatus';

const SELLER_PROOF_ELIGIBLE_STATUSES = new Set<string>([
  OrderStatus.SHIPPED_TO_MERIT_PENDING,
  OrderStatus.SHIPPED_TO_MERIT_COMPLETE,
  OrderStatus.READY_TO_SHIP,
  OrderStatus.SHIPPED,
  OrderStatus.DELIVERED,
  OrderStatus.RETURN_PENDING,
  OrderStatus.RETURN_COMPLETE,
]);

function isSplMeritProvider(shippingOption: string): boolean {
  return (
    shippingOption === ShippingProvider.SHIP_TO_MERIT ||
    shippingOption === ShippingProvider.MERIT_LOGISTICS ||
    shippingOption === ShippingProvider.BY_MERIT
  );
}

function isSelfManagedProvider(shippingOption: string): boolean {
  return (
    shippingOption === ShippingProvider.SELF_MANAGED ||
    shippingOption === ShippingProvider.SELF_MANAGED_LEGACY
  );
}

function isInAwbHeaderStatus(status: string): boolean {
  return (
    status === OrderStatus.READY_TO_SHIP ||
    status === OrderStatus.SHIPPED ||
    status === OrderStatus.DELIVERED
  );
}

function shouldShowSplMeritAwbActions(
  shippingOption: string,
  status: string,
  isAwbGenerating: boolean,
  awbUploaded: boolean,
): boolean {
  if (!isSplMeritProvider(shippingOption) || !isInAwbHeaderStatus(status)) {
    return false;
  }
  if (status === OrderStatus.READY_TO_SHIP) {
    return isAwbGenerating || (!isAwbGenerating && awbUploaded);
  }
  if (status === OrderStatus.SHIPPED || status === OrderStatus.DELIVERED) {
    return awbUploaded;
  }
  return false;
}

function getMainBadgeColor(status: string) {
  if (
    status === OrderStatus.SHIPPED_TO_MERIT_PENDING ||
    status === OrderStatus.SHIPPED_TO_MERIT_COMPLETE
  ) {
    return 'electricBlue' as const;
  }
  return getOrderStatusBadgeColor(status);
}

function shouldShowMeritLogisticsAwbReadyPill(
  status: string,
  shippingOption: string,
  awbUploaded: boolean,
): boolean {
  if (status !== 'READY_TO_SHIP' || !awbUploaded) {
    return false;
  }
  return (
    shippingOption === ShippingProvider.MERIT_LOGISTICS ||
    shippingOption === ShippingProvider.BY_MERIT
  );
}

export type TranslateFn = (key: string) => string;

export function deriveHeaderUiModel(
  status: string,
  shippingOption: string,
  awbUploaded: boolean,
  isAwbGenerating: boolean,
  hasProofUploaded: boolean,
  hasQcProof: boolean,
  translate: TranslateFn,
) {
  const isShipToMerit = isShipToMeritShipping(shippingOption);
  const shipToMeritDetailLabel =
    isShipToMerit && isShipToMeritStatus(status)
      ? SHIP_TO_MERIT_DETAIL_LABELS[status]
      : null;
  const showDetailBadge = Boolean(shipToMeritDetailLabel);
  const detailBadgeColor = showDetailBadge
    ? getShipToMeritDetailBadgeColor(status)
    : undefined;

  const showAdminActions = isShipToMerit;
  const showSplMeritAwbActions = shouldShowSplMeritAwbActions(
    shippingOption,
    status,
    isAwbGenerating,
    awbUploaded,
  );
  const showSelfManagedAwbDownload =
    isSelfManagedProvider(shippingOption) &&
    isInAwbHeaderStatus(status) &&
    awbUploaded;

  const hasHeaderActionsColumn =
    showAdminActions || showSplMeritAwbActions || showSelfManagedAwbDownload;

  const showSellerProofButton =
    showAdminActions &&
    hasProofUploaded &&
    SELLER_PROOF_ELIGIBLE_STATUSES.has(status);

  const stmPendingHelperText =
    status === OrderStatus.SHIPPED_TO_MERIT_PENDING
      ? translate('stmPendingHelper')
      : null;
  const stmCompleteHelperText =
    status === OrderStatus.SHIPPED_TO_MERIT_COMPLETE
      ? translate('stmCompleteHelper')
      : null;

  return {
    statusLabel: getOrderHeaderStatusLabel(status),
    mainBadgeColor: getMainBadgeColor(status),
    showDetailBadge,
    detailLabel: shipToMeritDetailLabel,
    detailBadgeColor,
    showAwbUploadedPill: awbUploaded && isSelfManagedProvider(shippingOption),
    showMeritLogisticsAwbReadyPill: shouldShowMeritLogisticsAwbReadyPill(
      status,
      shippingOption,
      awbUploaded,
    ),
    showAdminActions,
    showSplMeritAwbActions,
    showSelfManagedAwbDownload,
    hasHeaderActionsColumn,
    showSellerProofButton,
    stmPendingHelperText,
    stmCompleteHelperText,
    showStmPendingActions:
      showAdminActions && status === OrderStatus.SHIPPED_TO_MERIT_PENDING,
    showStmCompleteActions:
      showAdminActions && status === OrderStatus.SHIPPED_TO_MERIT_COMPLETE,
    showReturnQcProofButton:
      showAdminActions &&
      (status === OrderStatus.RETURN_PENDING ||
        status === OrderStatus.RETURN_COMPLETE) &&
      hasQcProof,
    splGeneratingButton:
      showSplMeritAwbActions &&
      status === OrderStatus.READY_TO_SHIP &&
      isAwbGenerating,
    splReadyDownloadRts:
      showSplMeritAwbActions &&
      status === OrderStatus.READY_TO_SHIP &&
      !isAwbGenerating &&
      awbUploaded,
    splDownloadShippedOrDelivered:
      showSplMeritAwbActions &&
      (status === OrderStatus.SHIPPED || status === OrderStatus.DELIVERED) &&
      awbUploaded,
  };
}

export type HeaderUiModel = ReturnType<typeof deriveHeaderUiModel>;
