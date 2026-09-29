import type {
  SellerDetails,
  SellerKybBusinessMetadata,
  SellerKybPrincipalPerson,
} from '@/types/seller';
import type { SellerKybViewModel } from '@/types/sellerKybViewModel';
import type { DetailedTenantProfile } from '@/types/tenantManagement';
import { getCountryName } from '@/utils/countryUtils';
import { formatDateDdMmYyOrRaw } from '@/utils/dateHelpers';
import { trimOrEmpty } from '@/utils/stringUtils';

function asBusinessMetadata(
  value: unknown,
): SellerKybBusinessMetadata | undefined {
  if (!value || typeof value !== 'object') return undefined;
  return value as SellerKybBusinessMetadata;
}

function asPrincipalPerson(
  value: unknown,
): SellerKybPrincipalPerson | undefined {
  if (!value || typeof value !== 'object') return undefined;
  return value as SellerKybPrincipalPerson;
}

export function buildSellerKybViewModel(
  profile: DetailedTenantProfile,
  sellerDetails: SellerDetails | undefined,
  fallbackDisplayName: string,
): SellerKybViewModel {
  const first = profile.customerProfileData[0];
  const bd = asBusinessMetadata(first?.businessDetailsMetadata);
  const beneficial = first?.beneficialOwnerMetadata ?? [];
  const directors = first?.directorsMetadata ?? [];
  const person = asPrincipalPerson(beneficial[0] ?? directors[0]);

  const countryRaw = trimOrEmpty(bd?.country);
  const countryDisplay = countryRaw ? getCountryName(countryRaw) : '';

  const legalNameEn =
    trimOrEmpty(bd?.businessName) ||
    trimOrEmpty(sellerDetails?.companyName) ||
    trimOrEmpty(profile.businessName) ||
    trimOrEmpty(profile.name);

  return {
    business: {
      crn:
        trimOrEmpty(bd?.businessRegistrationId) ||
        trimOrEmpty(sellerDetails?.businessRegistrationId),
      vatNumber: trimOrEmpty(bd?.taxNumber),
      state: trimOrEmpty(bd?.state),
      legalNameEn,
      legalNameAr: trimOrEmpty(bd?.businessNameAr),
      businessAddress: trimOrEmpty(bd?.businessAddress),
      city: trimOrEmpty(bd?.city),
      country: countryDisplay || countryRaw,
      zipPostal: trimOrEmpty(bd?.zipPostalCode),
    },
    role: {
      role: trimOrEmpty(person?.position),
      fullNameEn:
        trimOrEmpty(person?.fullName) ||
        trimOrEmpty(sellerDetails?.fullName) ||
        trimOrEmpty(profile.name) ||
        fallbackDisplayName,
      fullNameAr: trimOrEmpty(person?.fullNameAr),
      nationalId: trimOrEmpty(person?.passportNumberOrNationalId),
      dateOfBirth: formatDateDdMmYyOrRaw(person?.dateOfBirth),
    },
    financials: {
      iban: trimOrEmpty(bd?.iban),
      bankName: trimOrEmpty(bd?.bankName),
      currency: trimOrEmpty(bd?.currency),
    },
  };
}
