import { QueryClient, QueryClientConfig } from '@tanstack/react-query';

// Create a factory function that allows configuration
export function createQueryClient(options?: Partial<QueryClientConfig>) {
  return new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: 1,
        staleTime: 0,
        gcTime: 0,
        refetchOnMount: true,
        ...options?.defaultOptions?.queries,
      },
    },
    ...options,
  });
}
// Export a default instance for convenience
export const queryClient = createQueryClient();
