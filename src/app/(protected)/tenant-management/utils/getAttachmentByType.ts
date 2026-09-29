import type { AttachmentType } from '@/lib/enums';
import type { Attachment } from '@/types/tenantManagement';

export function getAttachmentByType(
  attachments: Attachment[],
  type: AttachmentType,
): Attachment | undefined {
  return attachments.find((attachment) => attachment.attachmentType === type);
}
