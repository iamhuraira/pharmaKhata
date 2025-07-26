export type ITableLabel = {
  name: string;
  sortable?: boolean;
};

export type ICustomBlock = {
  index: number;
  component: (data: any) => JSX.Element;
};
