import { adminApiClient } from '@/lib/apiClient';
import { CreateInviteRequest, CreateInviteResponse } from '@/types/invite';

/**
 * Create a new invitation (supports file upload for sellers)
 */
export const createInvite = async (
  request: CreateInviteRequest,
  file?: File,
): Promise<CreateInviteResponse> => {
  try {
    const formData = new FormData();

    formData.append('invitedBy', request.invitedBy);
    formData.append('email', request.email);
    formData.append('tenantName', request.tenantName);
    formData.append('platforms', JSON.stringify(request.platforms));
    formData.append('status', request.status);

    if (request.country) {
      formData.append('country', request.country);
    }

    if (request.accountManager) {
      formData.append('accountManager', request.accountManager);
    }

    if (request.metadata) {
      formData.append('metadata', JSON.stringify(request.metadata));
    }

    if (file) {
      formData.append('file', file);
    }

    const response = await adminApiClient.post('invites', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get invitation by ID
 */
export const getInviteById = async (
  id: string,
): Promise<CreateInviteResponse> => {
  try {
    const response = await adminApiClient.get(`invites/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Resend invitation email
 */
export const resendInvite = async (
  id: string,
): Promise<{ message: string }> => {
  try {
    const response = await adminApiClient.post(`invites/${id}/resend`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
