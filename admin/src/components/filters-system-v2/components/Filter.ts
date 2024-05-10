export type IIntermediateFilter = {
  key: string;
  filters: Filter[];
};

export type Filter = {
  title: string;
  name: string;
  parentGroup: string;
  parentFilter: string;
  missingLabel: string;
  sort: (data: any[]) => any;
  filter: (data?: any) => any;
  filterRootFilter: (data?: DataFilter[]) => any;
};

export type DataFilter = {
  key: string;
  doc_count: number;
};
