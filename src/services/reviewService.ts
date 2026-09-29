import { adminApiClient } from '@/lib/apiClient';
import { ReviewRequestPayload } from '@/types/review';

export const submitReviewRequest = async (payload: ReviewRequestPayload) => {
  const response = await adminApiClient.post('profiles-review', payload);
  return response.data;
};
