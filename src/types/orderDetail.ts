export interface OrderCustomer {
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  email: string | null;
}

export interface OrderDetailItem {
  id: string;
  sku: string;
  name: string | null;
  qty: number;
  unitPrice: number;
  totalPrice: number;
  meta: Record<string, unknown>;
}

export interface OrderShipmentDetail {
  id: string;
  addressLine: string | null;
  shortAddress: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  country: string | null;
  district: string | null;
  trackingId: string | null;
  trackingUrl: string | null;
  carrierName: string | null;
  awbFilePath: string | null;
  proofFilePath: string | null;
  qcProofFilePath: string | null;
  createdAt: string;
}

export interface OrderStatusHistoryItem {
  id: string;
  status: string;
  createdBy: 'merit' | 'seller';
  createdAt: string;
}

export interface OrderDetail {
  id: string;
  merchandizeOrderId: string;
  supplierId: string | null;
  supplierName: string | null;
  referenceId: string | null;
  status: string;
  shippingProvider: string | null;
  totalAmount: number;
  currency: string;
  estimatedDeliveryDate: string | null;
  isManual: boolean;
  isForwarded: boolean;
  placedAt: string | null;
  instructions: string | null;
  customer: OrderCustomer | null;
  items: OrderDetailItem[];
  shipmentDetails: OrderShipmentDetail[];
  statusHistory: OrderStatusHistoryItem[];
}
