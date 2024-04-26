export type SubFilter = {
  key: string;
  filters: Filter[];
};

export type Filter = {
  title: string;
  name: string;
  parentGroup: string;
  parentFilter: string;
  missingLabel: string;
  sort: (e: any) => any;
  filter: (data?: any) => any;
  filterSubFilter: (data?: any) => any;
};
