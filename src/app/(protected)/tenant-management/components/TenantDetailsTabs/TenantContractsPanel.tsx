'use client';

import React, { useRef, useState } from 'react';
import { BaseCard, Button, toast } from '@merit-incentives/ui';
import { File as FileIcon } from 'lucide-react';

import { useUploadTenantContracts } from '@/api-queries/tenantManagement';
import { AttachmentInlineActions } from '@/components/AttachmentInlineActions';
import {
  TENANT_CONTRACT_ALLOWED_EXTENSIONS,
  TENANT_CONTRACT_MAX_FILE_SIZE_BYTES,
  TENANT_CONTRACT_MAX_FILES_PER_REQUEST,
} from '@/constants/tenantContractUpload';
import { useLocalization } from '@/hooks';
import { downloadAttachment } from '@/lib/utils';
import type { DetailedTenantProfile } from '@/types/tenantManagement';

const ALLOWED_CONTRACT_EXTENSIONS = new Set<string>(
  TENANT_CONTRACT_ALLOWED_EXTENSIONS,
);

type TenantContractsPanelProps = {
  tenant: DetailedTenantProfile;
};

export function TenantContractsPanel({
  tenant,
}: Readonly<TenantContractsPanelProps>) {
  const { translate } = useLocalization('tenant-details');
  const uploadMutation = useUploadTenantContracts();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [viewingContractId, setViewingContractId] = useState<string | null>(
    null,
  );
  const [downloadingContractId, setDownloadingContractId] = useState<
    string | null
  >(null);

  const contracts = tenant.contracts ?? [];
  const customerProfileDataId = tenant.customerProfileData?.[0]?.id;

  const handleSelectFiles = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const selectedFiles = Array.from(event.target.files ?? []);
    if (
      !tenant.tenantId ||
      !customerProfileDataId ||
      selectedFiles.length === 0
    ) {
      return;
    }
    if (selectedFiles.length > TENANT_CONTRACT_MAX_FILES_PER_REQUEST) {
      toast.error(
        translate('contracts.maxFilesExceeded', {
          max: TENANT_CONTRACT_MAX_FILES_PER_REQUEST,
        }),
      );
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }
    const hasInvalidType = selectedFiles.some((file) => {
      const extension = file.name.split('.').pop()?.toLowerCase();
      return !extension || !ALLOWED_CONTRACT_EXTENSIONS.has(extension);
    });
    if (hasInvalidType) {
      toast.error(translate('contracts.invalidFileType'));
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }
    const hasOversizedFile = selectedFiles.some(
      (file) => file.size > TENANT_CONTRACT_MAX_FILE_SIZE_BYTES,
    );
    if (hasOversizedFile) {
      toast.error(translate('contracts.fileTooLarge'));
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    try {
      await uploadMutation.mutateAsync({
        tenantId: tenant.tenantId,
        customerProfileDataId,
        files: selectedFiles,
      });
      toast.success(translate('contracts.uploadSuccess'));
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : translate('contracts.uploadError');
      toast.error(message);
    }
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handleViewContract = (
    contractId: string,
    downloadUrl?: string | null,
  ) => {
    if (!downloadUrl) return;
    setViewingContractId(contractId);
    try {
      globalThis.open(downloadUrl, '_blank', 'noopener,noreferrer');
    } catch {
      toast.error(translate('contracts.viewError'));
    } finally {
      setViewingContractId(null);
    }
  };

  const handleDownloadContract = async (
    contractId: string,
    downloadUrl?: string | null,
    fileName?: string | null,
  ) => {
    if (!downloadUrl) return;
    setDownloadingContractId(contractId);
    try {
      await downloadAttachment(downloadUrl, fileName || 'contract');
    } catch {
      toast.error(translate('contracts.downloadError'));
    } finally {
      setDownloadingContractId(null);
    }
  };

  return (
    <div className="flex flex-col gap-mds-lg">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-medium text-mds-black-900">
            {translate('contracts.documentsTitle')}
          </h2>
          <p className="max-w-2xl text-sm font-normal text-mds-black-600">
            {translate('contracts.documentsDescription')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            multiple
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleSelectFiles}
          />
          <Button
            variant="secondary"
            onClick={openFilePicker}
            loading={uploadMutation.isPending}
            disabled={
              uploadMutation.isPending ||
              !tenant.tenantId ||
              !customerProfileDataId
            }
          >
            {translate('contracts.uploadButton')}
          </Button>
        </div>
      </div>
      <p className="text-sm text-mds-black-600">
        {translate('contracts.uploadRequirements')}
      </p>

      {contracts.length === 0 ? (
        <p className="text-sm font-normal text-mds-black-600">
          {translate('contracts.noContracts')}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {contracts.map((contract) => (
            <BaseCard
              key={contract.id}
              size="md"
              className="rounded-lg border border-mds-black-100 bg-mds-black-50/60 p-3 shadow-none"
            >
              <div className="flex items-start gap-3 rounded-lg border border-mds-black-100 bg-white px-3 py-3">
                <FileIcon className="h-5 w-5 shrink-0 text-mds-black-600" />
                <span
                  className="min-w-0 flex-1 break-words text-sm text-mds-black-700"
                  title={contract.fileName || ''}
                >
                  {contract.fileName}
                </span>
                <AttachmentInlineActions
                  viewAriaLabel={translate('contracts.view')}
                  downloadAriaLabel={translate('contracts.download')}
                  hasFile={Boolean(contract.downloadUrl)}
                  isViewLoading={viewingContractId === contract.id}
                  isDownloadLoading={downloadingContractId === contract.id}
                  onView={() =>
                    handleViewContract(contract.id, contract.downloadUrl)
                  }
                  onDownload={() =>
                    handleDownloadContract(
                      contract.id,
                      contract.downloadUrl,
                      contract.fileName,
                    )
                  }
                  eyeIconStyle="merit"
                />
              </div>
            </BaseCard>
          ))}
        </div>
      )}
    </div>
  );
}
