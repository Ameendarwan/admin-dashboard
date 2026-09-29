export interface AdminCarrierOption {
  key: string;
  value: string;
}

export interface AdminCarriersResponse {
  carriers: AdminCarrierOption[];
}

export interface AdminShippingControlPayload {
  tenantId: string;
  action:
    | 'change_provider'
    | 'change_carrier'
    | 'change_notification_throttle';
  shippingProvider?: 'merit_logistics' | 'self_managed' | 'ship_to_merit';
  carrierKey?: string;
  newOrderThrottleMinutes?: number;
  awbReadyThrottleMinutes?: number;
}
