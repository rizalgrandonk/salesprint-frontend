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
  withAvgs?: {
    relation: string;
    field: string;
  }[];
  orderBy?: {
    field: keyof T;
    value: "asc" | "desc";
  };
  filters?: {
    field: keyof T;
    operator: "=" | "!=" | ">" | "<" | ">=" | "<=";
    value: string | number;
  }[];
  search?: {
    field: keyof T;
    value: string;
  };

  page: number;
};

export type QueryParams<T> = Partial<Omit<QueryState<T>, "page">>;

export type MakePropertiesRequired<T, K extends keyof T> = Omit<T, K> & {
  [P in K]-?: T[P];
};
