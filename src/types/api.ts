export interface PaginatedMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginatedMeta;
}

export interface MessageResponse<T> {
  message: string;
  data: T;
}

export interface DataResponse<T> {
  data: T;
}

export interface MessageOnlyResponse {
  message: string;
} 