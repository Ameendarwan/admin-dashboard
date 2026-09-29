export const GC_EMAIL_TEMPLATE_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
} as const;

export type GcEmailTemplateStatus =
  (typeof GC_EMAIL_TEMPLATE_STATUS)[keyof typeof GC_EMAIL_TEMPLATE_STATUS];

export type GcEmailTemplateMock = Readonly<{
  id: string;
  templateName: string;
  submittedOn: string;
  submittedBy: string;
  status: GcEmailTemplateStatus;
  fileName: string;
  fileSizeLabel: string;
  fileDownloadUrl: string;
  previewLink: string;
  previewRecipientName: string;
  previewHeadline: string;
  previewMessage: string;
  previewCardReference: string;
  previewOrderReference: string;
}>;

/** Figma mock for GC Email tab (LiveOps node 5848:140054). */
export const mockGcEmailTemplate: GcEmailTemplateMock = {
  id: 'gc-email-template-1',
  templateName: 'Reward Delivery Email',
  submittedOn: '2020-06-12T00:00:00.000Z',
  submittedBy: 'Olivia Rhye',
  status: GC_EMAIL_TEMPLATE_STATUS.PENDING,
  fileName: 'acme-giftcard-email-v3.html',
  fileSizeLabel: '2.35 MB',
  fileDownloadUrl: '#',
  previewLink: 'https://preview.merit.sa/gc/acme/8f2a91',
  previewRecipientName: 'Alex',
  previewHeadline: '$100 {{Gift Card Name}}',
  previewMessage:
    'Hi Alex, here is a gift for your outstanding performance. Your card is ready to use immediately at participating retailers.',
  previewCardReference: '20250908-62082684',
  previewOrderReference: 'MYLIST-TEST-0809-001',
};
