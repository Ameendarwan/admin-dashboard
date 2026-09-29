'use client';

import React from 'react';

import { useLocalization } from '@/hooks/useLocalization';
import type { ReviewMode } from '@/lib/enums';
import type { RevisionFieldCallbacks } from '@/types/review';
import type {
  BeneficialOwnerMetadata,
  BusinessDetailsMetadata,
  DirectorMetadata,
} from '@/types/tenantManagement';
import { getCountryName } from '@/utils/countryUtils';

import { ReviewField } from '../ReviewField';

type PersonMetadata = DirectorMetadata | BeneficialOwnerMetadata;

/** Stable React list keys when passport/id is duplicated across rows. */
function withStablePersonKeys<T extends PersonMetadata>(
  people: T[],
): { person: T; key: string }[] {
  const seen = new Map<string, number>();

  return people.map((person) => {
    const fingerprint = [
      person.passportNumberOrNationalId,
      person.fullName,
      person.position,
      person.nationality,
    ].join('\u0001');
    const occurrence = seen.get(fingerprint) ?? 0;
    seen.set(fingerprint, occurrence + 1);
    const key =
      occurrence === 0 ? fingerprint : `${fingerprint}\u0001dup-${occurrence}`;

    return { person, key };
  });
}

type BusinessDetailsReviewProps = {
  businessDetails: BusinessDetailsMetadata;
  directors: DirectorMetadata[];
  beneficialOwners: BeneficialOwnerMetadata[];
  accountManager: string;
  mode: ReviewMode;
  onRevisionRequest: RevisionFieldCallbacks['onRevisionRequest'];
  onRevisionClear: RevisionFieldCallbacks['onRevisionClear'];
};

export function BusinessDetailsReview({
  businessDetails,
  directors,
  beneficialOwners,
  accountManager,
  mode,
  onRevisionRequest,
  onRevisionClear,
}: Readonly<BusinessDetailsReviewProps>) {
  const { translate } = useLocalization('business-details-review');

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-xl border border-mds-black-100 bg-white p-6 shadow-sm">
        <h2 className="mb-6 text-xl font-medium text-mds-black-900">
          {translate('title')}
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
          <ReviewField
            label={translate('fields.registrationId')}
            value={businessDetails.businessRegistrationId}
            fieldPath="businessDetails.registrationId"
            mode={mode}
            onRevisionRequest={onRevisionRequest}
            onRevisionClear={onRevisionClear}
          />
          <ReviewField
            label={translate('fields.taxNumber')}
            value={businessDetails.taxNumber}
            fieldPath="businessDetails.taxNumber"
            mode={mode}
            onRevisionRequest={onRevisionRequest}
            onRevisionClear={onRevisionClear}
          />
          <ReviewField
            label={translate('fields.businessUrl')}
            value={businessDetails.businessUrl || ''}
            fieldPath="businessDetails.businessUrl"
            mode={mode}
            onRevisionRequest={onRevisionRequest}
            onRevisionClear={onRevisionClear}
          />
          <ReviewField
            label={translate('fields.businessAddress')}
            value={businessDetails.businessAddress}
            fieldPath="businessDetails.businessAddress"
            mode={mode}
            onRevisionRequest={onRevisionRequest}
            onRevisionClear={onRevisionClear}
          />
          <div className="flex min-w-0 flex-col gap-1">
            <span className="text-sm font-medium text-mds-black-500">
              {translate('fields.accountManager')}
            </span>
            <span className="text-base font-medium text-mds-black-900 wrap-break-word">
              {accountManager.trim() ? accountManager : '—'}
            </span>
          </div>
          <ReviewField
            label={translate('fields.state')}
            value={businessDetails.state}
            fieldPath="businessDetails.state"
            mode={mode}
            onRevisionRequest={onRevisionRequest}
            onRevisionClear={onRevisionClear}
            isSelect
          />
          <ReviewField
            label={translate('fields.city')}
            value={businessDetails.city}
            fieldPath="businessDetails.city"
            mode={mode}
            onRevisionRequest={onRevisionRequest}
            onRevisionClear={onRevisionClear}
            isSelect
          />
          <ReviewField
            label={translate('fields.zipCode')}
            value={businessDetails.zipPostalCode}
            fieldPath="businessDetails.zipCode"
            mode={mode}
            onRevisionRequest={onRevisionRequest}
            onRevisionClear={onRevisionClear}
          />
          <ReviewField
            label={translate('fields.country')}
            value={getCountryName(businessDetails.country)}
            fieldPath="businessDetails.country"
            mode={mode}
            onRevisionRequest={onRevisionRequest}
            onRevisionClear={onRevisionClear}
            isSelect
          />
        </div>
      </div>

      <div className="rounded-xl border border-mds-black-100 bg-white p-6 shadow-sm">
        <h2 className="mb-6 text-xl font-medium text-mds-black-900">
          {translate('listOfDirectors')}
        </h2>
        {directors?.length ? (
          <div className="flex flex-col gap-4">
            {withStablePersonKeys(directors).map(
              ({ person: director, key }) => (
                <div
                  key={key}
                  className="rounded-lg border border-mds-black-100 bg-mds-black-50/60 p-6"
                >
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
                    <ReviewField
                      label={translate('fields.name')}
                      value={director.fullName}
                      fieldPath={`directors.${director.passportNumberOrNationalId}.fullName`}
                      mode={mode}
                      onRevisionRequest={onRevisionRequest}
                      onRevisionClear={onRevisionClear}
                    />
                    <ReviewField
                      label={translate('fields.position')}
                      value={director.position}
                      fieldPath={`directors.${director.passportNumberOrNationalId}.position`}
                      mode={mode}
                      onRevisionRequest={onRevisionRequest}
                      onRevisionClear={onRevisionClear}
                    />
                    <ReviewField
                      label={translate('fields.nationality')}
                      value={director.nationality}
                      fieldPath={`directors.${director.passportNumberOrNationalId}.nationality`}
                      mode={mode}
                      onRevisionRequest={onRevisionRequest}
                      onRevisionClear={onRevisionClear}
                    />
                    <ReviewField
                      label={translate('fields.passportNoNationalId')}
                      value={director.passportNumberOrNationalId}
                      fieldPath={`directors.${director.passportNumberOrNationalId}.passportNumberOrNationalId`}
                      mode={mode}
                      onRevisionRequest={onRevisionRequest}
                      onRevisionClear={onRevisionClear}
                    />
                  </div>
                </div>
              ),
            )}
          </div>
        ) : (
          <p className="text-sm text-mds-black-600">—</p>
        )}
      </div>

      <div className="rounded-xl border border-mds-black-100 bg-white p-6 shadow-sm">
        <h2 className="mb-6 text-xl font-medium text-mds-black-900">
          {translate('beneficialOwners')}
        </h2>
        {beneficialOwners?.length ? (
          <div className="flex flex-col gap-4">
            {withStablePersonKeys(beneficialOwners).map(
              ({ person: beneficialOwner, key }) => (
                <div
                  key={key}
                  className="rounded-lg border border-mds-black-100 bg-mds-black-50/60 p-6"
                >
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
                    <ReviewField
                      label={translate('fields.name')}
                      value={beneficialOwner.fullName}
                      fieldPath={`beneficialOwners.${beneficialOwner.passportNumberOrNationalId}.fullName`}
                      mode={mode}
                      onRevisionRequest={onRevisionRequest}
                      onRevisionClear={onRevisionClear}
                    />
                    <ReviewField
                      label={translate('fields.position')}
                      value={beneficialOwner.position}
                      fieldPath={`beneficialOwners.${beneficialOwner.passportNumberOrNationalId}.position`}
                      mode={mode}
                      onRevisionRequest={onRevisionRequest}
                      onRevisionClear={onRevisionClear}
                    />
                    <ReviewField
                      label={translate('fields.nationality')}
                      value={beneficialOwner.nationality}
                      fieldPath={`beneficialOwners.${beneficialOwner.passportNumberOrNationalId}.nationality`}
                      mode={mode}
                      onRevisionRequest={onRevisionRequest}
                      onRevisionClear={onRevisionClear}
                    />
                    <ReviewField
                      label={translate('fields.passportNoNationalId')}
                      value={beneficialOwner.passportNumberOrNationalId}
                      fieldPath={`beneficialOwners.${beneficialOwner.passportNumberOrNationalId}.passportNumberOrNationalId`}
                      mode={mode}
                      onRevisionRequest={onRevisionRequest}
                      onRevisionClear={onRevisionClear}
                    />
                  </div>
                </div>
              ),
            )}
          </div>
        ) : (
          <p className="text-sm text-mds-black-600">—</p>
        )}
      </div>
    </div>
  );
}
