"use client";

import { useEffect, useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  ColumnDef,
} from "@tanstack/react-table";

import SearchInput from "./searchinput";
import Pagination from "./pagination";
import {
  CircleChevronDown,
  CircleChevronRight,
  CircleChevronUp,
} from "lucide-react";
import { Column, DataTableProps } from "@/types/table";

function DataTable<T>({
  data,
  columns,
  rowsPerPage = 5,
  hasSearch = true,
  hasPagination = true,
  rowGroup = false,
  nameRowGroup,
  children,
  loading = false,
}: DataTableProps<T>) {
  const [search, setSearch] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [sorting, setSorting] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [collapsedGroups, setCollapsedGroups] = useState<
    Record<string, boolean>
  >({});

  // normalize columns
  const updatedColumns: Column<T>[] = columns.map((col) => ({
    ...col,
    visible: col.visible !== false,
  }));

  // map sang TanStack
  const tableColumns = useMemo<ColumnDef<T>[]>(
    () =>
      updatedColumns
        .filter((col) => col.visible)
        .map((col) => ({
          accessorKey: col.accessor as string,
          header: col.label,

          meta: {
            className: col.className,
            width: col.width,
          },

          cell: (info) => {
            const row = info.row.original;
            const idx = info.row.index;

            if (col.render) {
              return col.render(row, idx, currentPage, rowsPerPage);
            }

            if (col.accessor === "ID") {
              return (currentPage - 1) * rowsPerPage + idx + 1;
            }

            return info.getValue();
          },
        })),
    [columns], // ⚠️ quan trọng
  );

  const table = useReactTable({
    data,
    columns: tableColumns,

    state: {
      sorting,
      globalFilter: search,
      pagination: {
        pageIndex: currentPage - 1,
        pageSize: rowsPerPage,
      },
    },

    onSortingChange: setSorting,
    onGlobalFilterChange: setSearch,

    globalFilterFn: (row, _, value) => {
      return Object.values(row.original as any)
        .join(" ")
        .toLowerCase()
        .includes(value.toLowerCase());
    },

    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  // reset page khi data đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [data]);

  // sync page với table
  useEffect(() => {
    table.setPageIndex(currentPage - 1);
  }, [currentPage, table]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (!value.startsWith(" ")) {
      setSearch(value);
      setCurrentPage(1);
    }
  };

  const toggleGroup = (group: string) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [group]: !prev[group],
    }));
  };

  return (
    <div>
      {hasSearch && (
        <SearchInput
          className="m-0 w-1/3"
          searchValue={search}
          onChange={handleChange}
        />
      )}

      {children && <div>{children}</div>}

      <div className="overflow-y-auto relative mt-3">
        {/* 🔥 FIX QUAN TRỌNG */}
        <table className="w-full table-fixed border-collapse border-spacing-0">
          {/* HEADER */}
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const meta = header.column.columnDef.meta as any;
                  const isSorted = header.column.getIsSorted();

                  return (
                    <th
                      key={header.id}
                      onClick={header.column.getToggleSortingHandler()}
                      style={{ width: meta?.width }}
                      className={`px-1 py-2 text-[15px] text-center border-b border-gray-300 bg-blue-100 text-blue-900 sticky top-0 cursor-pointer ${meta?.className || ""}`}
                    >
                      <div
                        className={`text-center ${isSorted ? "flex items-center justify-around" : ""} `}
                      >
                        <span>
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                        </span>

                        {isSorted === "asc" && (
                          <CircleChevronUp className="w-4 h-4 min-w-4 min-h-4 ml-2" />
                        )}
                        {isSorted === "desc" && (
                          <CircleChevronDown className="w-4 h-4 min-w-4 min-h-4 ml-2" />
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>

          {/* BODY */}
          <tbody>
            {!data || data.length === 0 ? (
              <tr>
                <td
                  colSpan={updatedColumns.length}
                  className="text-center bg-gray-100"
                >
                  Không có dữ liệu
                </td>
              </tr>
            ) : rowGroup && nameRowGroup ? (
              Object.entries(
                groupBy(
                  table.getRowModel().rows.map((r) => r.original),
                  nameRowGroup,
                ),
              ).map(([groupName, rows]) => {
                const isCollapsed = collapsedGroups[groupName];

                return (
                  <>
                    {/* 🔹 GROUP HEADER */}
                    <tr key={groupName}>
                      <td
                        colSpan={updatedColumns.length}
                        className="bg-gray-100 font-semibold px-2 py-2 cursor-pointer"
                        onClick={() => toggleGroup(groupName)}
                      >
                        <div className="flex items-center gap-2">
                          {isCollapsed ? (
                            <CircleChevronRight className="w-4 h-4 min-w-4 min-h-4 ml-2" />
                          ) : (
                            <CircleChevronDown className="w-4 h-4 min-w-4 min-h-4 ml-2" />
                          )}
                          {groupName} ({rows.length})
                        </div>
                      </td>
                    </tr>

                    {/* 🔹 ROWS */}
                    {rows.map((row, idx) => (
                      <tr
                        key={idx}
                        className={`transition-all duration-300 ease-in-out ${
                          isCollapsed ? "hidden fade-out" : "fade-in"
                        }`}
                      >
                        {updatedColumns
                          .filter((col) => col.visible)
                          .map((col, colIdx) => (
                            <td
                              key={colIdx}
                              className={`px-1 py-3 border ${
                                col.className || ""
                              }`}
                            >
                              {col.render
                                ? col.render(
                                    row,
                                    rowGroup ? idx : idx + 1, // reset STT theo group
                                    currentPage,
                                    rowsPerPage,
                                  )
                                : (row as any)[col.accessor]}
                            </td>
                          ))}
                      </tr>
                    ))}
                  </>
                );
              })
            ) : (
              // 🔹 NORMAL MODE (không group)
              table.getRowModel().rows.map((row) => (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => {
                    const meta = cell.column.columnDef.meta as any;

                    return (
                      <td
                        key={cell.id}
                        style={{ width: meta?.width }}
                        className={`px-1 py-3 border ${meta?.className || ""}`}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* PAGINATION */}
        {hasPagination && (
          <Pagination
            currentPage={currentPage}
            totalPage={table.getPageCount()}
            onPageChange={(page) => setCurrentPage(page)}
          />
        )}
      </div>
    </div>
  );
}

function groupBy<T>(data: T[], key: keyof T) {
  return data.reduce((acc: Record<string, T[]>, item) => {
    const groupKey = String(item[key]);
    if (!acc[groupKey]) acc[groupKey] = [];
    acc[groupKey].push(item);
    return acc;
  }, {});
}

export default DataTable;
