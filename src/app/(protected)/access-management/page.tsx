'use client';

import React from 'react';
import { Button } from '@merit-incentives/ui';
import { CirclePlus } from 'lucide-react';

import { ConfirmationPopup } from '@/components/ConfirmationPopup';
import {
  InviteUserDialog,
  EditUserDialog,
  PermissionsDialog,
  AccessManagementTable,
} from '@/app/(protected)/access-management/components';
import { PageHeader } from '@/components/PageHeader';
import { useLocalization } from '@/hooks/useLocalization';
import {
  useAccessManagement,
  createFilterOptions,
} from '@/app/(protected)/access-management/hooks/useAccessManagement';

export default function AccessManagementPage() {
  const { translate } = useLocalization('access-management');

  const {
    users,
    pagination,
    isLoading,
    sortOrder,
    isInviteDialogOpen,
    isEditDialogOpen,
    selectedUserForEdit,
    isPermissionsDialogOpen,
    showInviteSuccessPopup,
    showInviteErrorPopup,
    inviteErrorType,
    invitedEmail,
    domainOptions,
    roleOptions,
    statusOptions,
    handleInviteUser,
    handleEditUser,
    handleSaveEditUser,
    handleDeleteUser,
    handleConfirmDelete,
    handleViewPermissions,
    handleInvite,
    handleUserSelect,
    handlePageChange,
    handleSearchChange,
    handleRoleFilterChange,
    handleDomainFilterChange,
    handleStatusFilterChange,
    handleSortChange,
    handleCloseInviteDialog,
    handleCloseEditDialog,
    handleCloseDeleteDialog,
    handleClosePermissionsDialog,
    handleCloseSuccessPopup,
    handleCloseInviteErrorPopup,
    handleResendInvite,
    isDeleteDialogOpen,
    selectedUserForDelete,
  } = useAccessManagement(10);

  return (
    <div id="access-management-page" className="min-h-screen">
      <div className="space-y-1">
        {/* Header */}
        <div className="space-y-6">
          <PageHeader title={translate('title')}>
            <div className="flex gap-3">
              <Button variant="secondary" onClick={handleViewPermissions}>
                {translate('viewPermissionList')}
              </Button>
              <Button
                variant="primary"
                onClick={handleInviteUser}
                leftIcon={<CirclePlus className="h-5 w-5" />}
              >
                {translate('inviteNewUser')}
              </Button>
            </div>
          </PageHeader>

          {/* Access Management Table */}
          <AccessManagementTable
            users={users}
            onUserSelect={handleUserSelect}
            onEditUser={handleEditUser}
            onDeleteUser={handleDeleteUser}
            onResendInvite={handleResendInvite}
            onPageChange={handlePageChange}
            pagination={pagination}
            loadingRowId={null}
            onSearchChange={handleSearchChange}
            onRoleFilterChange={handleRoleFilterChange}
            onDomainFilterChange={handleDomainFilterChange}
            onStatusFilterChange={handleStatusFilterChange}
            sortOrder={sortOrder}
            onSortChange={handleSortChange}
            loading={isLoading}
            domainOptions={domainOptions}
            roleOptions={roleOptions}
            statusOptions={statusOptions}
            createFilterOptions={createFilterOptions}
          />
        </div>

        {/* Invite User Dialog */}
        <InviteUserDialog
          isOpen={isInviteDialogOpen}
          onClose={handleCloseInviteDialog}
          onInvite={handleInvite}
          roleOptions={roleOptions}
          domainOptions={domainOptions}
          isLoading={isLoading}
        />

        {/* Edit User Dialog */}
        <EditUserDialog
          isOpen={isEditDialogOpen}
          onClose={handleCloseEditDialog}
          onSave={handleSaveEditUser}
          userData={
            selectedUserForEdit
              ? {
                  fullName: selectedUserForEdit.fullName,
                  email: selectedUserForEdit.email,
                  domain: selectedUserForEdit.domain,
                  role: selectedUserForEdit.role,
                  status: selectedUserForEdit.status as 'active' | 'inactive',
                }
              : null
          }
          roleOptions={roleOptions}
          domainOptions={domainOptions}
          isLoading={isLoading}
        />

        {/* Permissions Dialog */}
        <PermissionsDialog
          isOpen={isPermissionsDialogOpen}
          onClose={handleClosePermissionsDialog}
        />

        {/* Success Popup */}
        <ConfirmationPopup
          isOpen={showInviteSuccessPopup}
          onClose={handleCloseSuccessPopup}
          type="success"
          title={translate('inviteSuccess')}
          description={translate('inviteSuccessMessage', {
            email: invitedEmail,
          })}
          primaryButton={{
            text: translate('ok'),
            variant: 'primary',
          }}
          onPrimaryAction={handleCloseSuccessPopup}
        />

        <ConfirmationPopup
          isOpen={showInviteErrorPopup}
          onClose={handleCloseInviteErrorPopup}
          type="warning"
          title={translate('inviteError.title')}
          description={
            <>
              {translate('inviteError.messagePrefix')}{' '}
              <strong>{invitedEmail}</strong>{' '}
              {translate(
                inviteErrorType === 'already_in_tenant'
                  ? 'inviteError.messageSuffix'
                  : 'inviteError.messageSuffixOtherPlatform',
              )}
            </>
          }
          primaryButton={{
            text: translate('inviteError.confirmText'),
            variant: 'primary',
          }}
          onPrimaryAction={handleCloseInviteErrorPopup}
        />

        {/* Delete Confirmation Dialog */}
        <ConfirmationPopup
          isOpen={isDeleteDialogOpen}
          onClose={handleCloseDeleteDialog}
          type="delete"
          title={translate('deleteUser')}
          description={
            selectedUserForDelete
              ? translate('deleteUserConfirmation', {
                  name: selectedUserForDelete.fullName,
                  email: selectedUserForDelete.email,
                })
              : translate('deleteUserConfirmationGeneric')
          }
          primaryButton={{
            text: translate('delete'),
            variant: 'negative',
          }}
          secondaryButton={{
            text: translate('cancel'),
            variant: 'secondary',
          }}
          onPrimaryAction={handleConfirmDelete}
          onSecondaryAction={handleCloseDeleteDialog}
        />
      </div>
    </div>
  );
}
