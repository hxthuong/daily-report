import { useMemo } from "react";

type Column<T> = {
  accessor: keyof T | string; // field trong dữ liệu
  label: string; // tên hiển thị cột
};

type TableProps<T> = {
  data: T[];
  columns: Column<T>[];
  search?: string;
  sortField?: keyof T;
  sortOrder?: "asc" | "desc";
  currentPage: number;
  rowsPerPage: number;
};

type TableDataResult<T> = {
  paginated: T[];
  totalPages: number;
  totalRows: number;
};

function useTableData<T>({
  data = [],
  columns,
  search,
  sortField,
  sortOrder = "asc",
  currentPage,
  rowsPerPage,
}: TableProps<T>): TableDataResult<T> {
  const processedData = useMemo(() => {
    const EMPTY_RESULT: TableDataResult<T> = {
      paginated: [],
      totalPages: 0,
      totalRows: 0,
    };

    if (!Array.isArray(data)) return EMPTY_RESULT;

    let result = [...data];

    // 1. Filter
    if (search) {
      result = result.filter((row) =>
        columns.some((col) => {
          const value = row[col.accessor as keyof T];
          return value
            ?.toString()
            .toLowerCase()
            .includes(search.trim().toLowerCase());
        })
      );
    }

    // 2. Sort
    if (sortField) {
      result.sort((a, b) => {
        const valA = a[sortField];
        const valB = b[sortField];

        if (valA == null) return 1;
        if (valB == null) return -1;

        if (valA < valB) return sortOrder === "asc" ? -1 : 1;
        if (valA > valB) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
    }

    // 3. Pagination
    const totalRows = result.length;
    const totalPages = Math.ceil(totalRows / rowsPerPage);
    const paginated = result.slice(
      (currentPage - 1) * rowsPerPage,
      currentPage * rowsPerPage
    );

    return { paginated, totalPages, totalRows };
  }, [data, columns, search, sortField, sortOrder, currentPage, rowsPerPage]);

  return processedData;
}

export default useTableData;
