export type PaginatedData<T> = {
  current_page: number;
  data: T;
  from: number;
  last_page: number;
  per_page: number;
  to: number;
  total: number;
};

export type QueryState<T> = {
  limit: number;
  with?: string[];
  withCount?: string[];
  orderBy: {
    field: keyof T;
    value: "asc" | "desc";
  };
  filters?: {
    field: keyof T;
    value: "asc" | "desc";
  }[];
  search?: {
    field: keyof T;
    value: "asc" | "desc";
  };

  current_page: number;
};
