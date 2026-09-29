export function sellerOrdersTabErrorDescription(error: unknown): string {
  return error instanceof Error ? error.message : 'Unknown error occurred';
}
