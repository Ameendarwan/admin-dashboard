export function logError(
  description: string,
  error?: unknown,
  additionalInfo?: Record<string, unknown>,
) {
  const errorObj = error instanceof Error ? error : new Error(String(error));
  const timestamp = new Date().toISOString();
  const page =
    typeof window !== 'undefined' ? window.location.pathname : 'unknown';

  const contextMessage = {
    description,
    timestamp,
    page,
    ...additionalInfo,
    environment: process.env.NEXT_PUBLIC_ENVIRONMENT,
    errorMessage: errorObj.message,
    stack: errorObj.stack,
  };

  // eslint-disable-next-line no-console -- central error sink for devtools
  console.error(contextMessage);
}
