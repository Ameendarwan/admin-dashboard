import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { SellerStatus, TenantInviteStatus, TenantJourney } from '@/lib/enums';
import type { SellerJourney } from '@/services/sellerService';
import useDebounce from '@/hooks/useDebounce';
import { useSellerInvites } from '@/api-queries/seller';
import { useCreateInvite, useResendInvite } from '@/api-queries/invite';
import { useAuth } from '@/app/contexts/auth-context';
import type { MappedSellerInvite } from '@/types/invite';
import { logError } from '@/utils/errorLogger';
import {
  buildSellerDetailHref,
  getTenantIdForSellerDetailRoute,
} from '@/utils/sellerTenantRoute';
type EnhancedError = Error & {
  errorCode?: string;
  originalResponse?: {
    errorCode?: string;
    [key: string]: unknown;
  };
  response?: {
    data?: {
      errorCode?: string;
      [key: string]: unknown;
    };
  };
};
const STATUS_MAP = {
  toApi: {
    [SellerStatus.INVITE_SENT]: TenantInviteStatus.PENDING,
    [SellerStatus.INVITE_ACCEPTED]: TenantInviteStatus.ACCEPTED,
  } as const,
  fromApi: {
    [TenantInviteStatus.PENDING]: SellerStatus.INVITE_SENT,
    [TenantInviteStatus.ACCEPTED]: SellerStatus.INVITE_ACCEPTED,
  } as const,
};
export const mapApiStatusToSellerStatus = (apiStatus: string): string => {
  return (
    STATUS_MAP.fromApi[apiStatus as keyof typeof STATUS_MAP.fromApi] ||
    apiStatus
  );
};

export const useSellersPage = (pageSize: number = 10) => {
  const router = useRouter();
  const { user } = useAuth();
  const [journey, setJourney] = useState<SellerJourney>(
    TenantJourney.ONBOARDED,
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [searchValue, setSearchValue] = useState('');
  const [statusFilter, setStatusFilter] = useState<SellerStatus | ''>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [showInviteSuccessPopup, setShowInviteSuccessPopup] = useState(false);
  const [showInviteErrorPopup, setShowInviteErrorPopup] = useState(false);
  const [invitedEmail, setInvitedEmail] = useState('');

  const debouncedSearchQuery = useDebounce(searchValue, 300);
  const mapSellerStatusToApiStatus = (
    sellerStatus: SellerStatus | '',
  ): string | undefined => {
    if (!sellerStatus) return undefined;
    return STATUS_MAP.toApi[sellerStatus];
  };
  const { data, isLoading, error } = useSellerInvites(
    currentPage,
    pageSize,
    mapSellerStatusToApiStatus(statusFilter),
    debouncedSearchQuery,
    sortOrder,
    journey,
  );

  const createInviteMutation = useCreateInvite();
  const resendInviteMutation = useResendInvite();

  const sellerInvites: MappedSellerInvite[] = (data?.data || []).map(
    (invite) => {
      let state: string;
      if (journey === TenantJourney.ONBOARDED) {
        state = invite.status;
      } else {
        state = mapApiStatusToSellerStatus(invite.status);
      }
      return {
        ...invite,
        name: invite.tenantName,
        businessName: invite.tenantName,
        state,
      };
    },
  );

  const pagination = {
    page: currentPage,
    totalPages: data?.totalPages ?? 1,
    total: data?.total ?? 0,
  };
  const showErrorState = error && !isLoading;
  const showEmptyState =
    !isLoading && !error && (!sellerInvites || sellerInvites.length === 0);
  const handleInviteSeller = () => {
    setIsInviteDialogOpen(true);
  };

  const handleInvite = async (
    email: string,
    companyName: string,
    supplierId: string,
    shippingProvider: string,
    businessRegistrationId: string,
    file: File,
  ) => {
    if (!user?.userId) return;

    try {
      await createInviteMutation.mutateAsync({
        request: {
          invitedBy: user.userId,
          email,
          tenantName: companyName,
          platforms: ['seller-portal'],
          status: TenantInviteStatus.PENDING,
          metadata: {
            supplierId,
            businessRegistrationId,
            shippingProvider,
          },
        },
        file,
      });

      setInvitedEmail(email);
      setShowInviteSuccessPopup(true);
      setIsInviteDialogOpen(false);
    } catch (error) {
      const enhancedError = error as EnhancedError;
      const errorCode =
        enhancedError?.errorCode ||
        enhancedError?.response?.data?.errorCode ||
        enhancedError?.originalResponse?.errorCode;

      const errorMessage = enhancedError?.message || '';
      const isInvitationExistsError =
        errorCode === 'INVITATION_ALREADY_EXISTS' ||
        (errorMessage.toLowerCase().includes('invitation') &&
          errorMessage.toLowerCase().includes('already exists'));

      if (isInvitationExistsError) {
        setInvitedEmail(email);
        setShowInviteErrorPopup(true);
        setIsInviteDialogOpen(false);
      } else {
        logError('Error creating seller invite', enhancedError, {
          email,
          errorCode,
          errorMessage,
        });
      }
    }
  };

  const handleSellerSelect = (sellerInvite: MappedSellerInvite) => {
    const tenantId = getTenantIdForSellerDetailRoute(sellerInvite);
    router.push(buildSellerDetailHref(tenantId, sellerInvite.email));
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (value: SellerStatus | '') => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handleJourneyChange = (newJourney: SellerJourney) => {
    setJourney(newJourney);
    setCurrentPage(1);
    setStatusFilter('');
  };

  const handleSortChange = (order: 'asc' | 'desc' | null) => {
    if (order === null) {
      setSortOrder('desc');
    } else {
      setSortOrder(order);
    }
  };

  const handleCloseInviteDialog = () => {
    setIsInviteDialogOpen(false);
  };

  const handleCloseSuccessPopup = () => {
    setShowInviteSuccessPopup(false);
  };

  const handleCloseErrorPopup = () => {
    setShowInviteErrorPopup(false);
    setInvitedEmail('');
  };

  const handleResendInvite = async (seller: MappedSellerInvite) => {
    try {
      await resendInviteMutation.mutateAsync(seller.id);
      setInvitedEmail(seller.email);
      setShowInviteSuccessPopup(true);
    } catch (error) {
      logError('Error resending seller invite', error);
    }
  };

  return {
    sellerInvites,
    pagination,
    isLoading,
    error,
    showErrorState,
    showEmptyState,
    journey,
    sortOrder,
    isInviteDialogOpen,
    showInviteSuccessPopup,
    showInviteErrorPopup,
    invitedEmail,
    createInviteMutation,
    resendInviteMutation,
    handleJourneyChange,
    handleInviteSeller,
    handleInvite,
    handleSellerSelect,
    handlePageChange,
    handleSearchChange,
    handleStatusFilterChange,
    handleSortChange,
    handleCloseInviteDialog,
    handleCloseSuccessPopup,
    handleCloseErrorPopup,
    handleResendInvite,
  };
};
