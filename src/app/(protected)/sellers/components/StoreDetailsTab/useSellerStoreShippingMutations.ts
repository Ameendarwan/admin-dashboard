import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@merit-incentives/ui';

import { useLocalization } from '@/hooks/useLocalization';
import { updateSellerShippingControl } from '@/services/sellerService';
import type { AdminShippingControlPayload } from '@/types/sellerAdminShipping';
import { logError } from '@/utils/errorLogger';

export function useSellerStoreShippingMutations(tenantId: string | undefined) {
  const queryClient = useQueryClient();
  const { translate } = useLocalization('seller-details');

  const shippingControlMutation = useMutation({
    mutationFn: (payload: AdminShippingControlPayload) =>
      updateSellerShippingControl(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-details', tenantId] });
    },
    onError: (error) => {
      logError('Seller shipping control update failed', error);
      toast.error(translate('errors.updateShippingFailed'));
    },
  });

  return { shippingControlMutation };
}
