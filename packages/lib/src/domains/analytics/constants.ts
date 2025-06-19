export interface SearchParams {
  searchTerm?: SearchTerm;
  filters?: Record<string, string | string[]>;
  musts?: Record<string, string | string[]>;
  ranges?: Record<string, { from?: Date; to?: Date }>;
  existingFields?: string[];
  sourceFields?: string[];
  page?: number;
  size?: number;
  sortField?: string;
  sortOrder?: "asc" | "desc";
  full?: boolean;
}

export interface SearchTerm {
  value: string;
  fields: string[];
}

export interface SearchResult<T> {
  hits: T[];
  total: number;
}
