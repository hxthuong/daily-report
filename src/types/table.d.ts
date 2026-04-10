export type Column<T> = {
  accessor: keyof T | string;
  label: string;
  width?: string | number;
  className?: string;
  visible?: boolean;
  render?: (
    row: T,
    rowIndex: number,
    currentPage: number,
    rowsPerPage: number,
  ) => React.ReactNode;
};

export type DataTableProps<T> = {
  data: T[];
  columns: Column<T>[];
  rowsPerPage?: number;
  hasSearch?: boolean;
  hasPagination?: boolean;
  children?: React.ReactNode;
  loading?: boolean;
  rowGroup?: boolean;
  nameRowGroup?: keyof T;
};
