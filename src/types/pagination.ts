export interface Pagination {
  page: number;
  totalPages: number;
  total: number;
}

export interface PaginatedResponse<T> extends Pagination {
  data: T[];
}
