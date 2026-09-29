import { Button } from '@merit-incentives/ui';

interface TableStateDisplayProps {
  type: 'error' | 'empty';
  title: string;
  description: string;
  showRetryButton?: boolean;
  onRetry?: () => void;
  retryButtonText?: string;
  retryLoading?: boolean;
}

export function TableStateDisplay({
  type,
  title,
  description,
  showRetryButton = false,
  onRetry,
  retryButtonText = 'Retry',
  retryLoading = false,
}: Readonly<TableStateDisplayProps>) {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="flex w-full max-w-lg flex-col items-center text-center">
        {type === 'error' ? (
          <h2 className="mb-2 text-xl font-semibold text-mds-error-600">
            {title}
          </h2>
        ) : (
          <h2 className="mb-2 text-xl font-semibold text-mds-black-600">
            {title}
          </h2>
        )}
        <p className="w-full text-mds-black-500">{description}</p>
        {showRetryButton && onRetry && (
          <Button
            variant="secondary"
            onClick={onRetry}
            className="mt-4 shrink-0"
            loading={retryLoading}
            disabled={retryLoading}
          >
            {retryButtonText}
          </Button>
        )}
      </div>
    </div>
  );
}
