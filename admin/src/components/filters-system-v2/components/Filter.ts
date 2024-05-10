export type IIntermediateFilter = {
  key: string;
  filters: RowFilter[];
};

export type RowFilter = {
  title: string;
  name: string;
  parentGroup: string;
  parentFilter: string;
  missingLabel: string;
  sort: (data: DataFilter[]) => DataFilter;
  filter: (data?: DataFilter) => DataFilter;
  filterRootFilter: (data?: DataFilter[]) => DataFilter[];
};

export type DataFilter = {
  key: string;
  doc_count: number;
};
