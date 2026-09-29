export interface SellerKybBusinessDisplay {
  crn: string;
  vatNumber: string;
  state: string;
  legalNameEn: string;
  legalNameAr: string;
  businessAddress: string;
  city: string;
  country: string;
  zipPostal: string;
}

export interface SellerKybRoleDisplay {
  role: string;
  fullNameEn: string;
  fullNameAr: string;
  nationalId: string;
  dateOfBirth: string;
}

export interface SellerKybFinancialsDisplay {
  iban: string;
  bankName: string;
  currency: string;
}

export interface SellerKybViewModel {
  business: SellerKybBusinessDisplay;
  role: SellerKybRoleDisplay;
  financials: SellerKybFinancialsDisplay;
}
