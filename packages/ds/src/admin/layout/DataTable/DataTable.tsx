import React, { HTMLAttributes, useMemo } from "react";
import cx from "classnames";
import { HiFilter } from "react-icons/hi";

import { Button, Select } from "../..";
import SortOption from "./SortOption";
import Loader from "./Loader";

export type Row<T extends string, U extends Record<T, any>> = {
  id: string;
  data: U;
};

export type DataTableRow = Row<string, any>;

export type Column<R extends DataTableRow> = {
  key: string;
  className?: string;
  title?: string;
  filtrable?: boolean;
  filterKeys?: {
    key: string;
    label: string;
    external?: boolean;
    externalKey?: string;
  }[];
  filterFn?: (data: R["data"], value: string, key: string) => boolean;
  renderFilter?: (data: string, key: string) => string;
  renderCell?: (data: R["data"], row: R) => React.ReactNode;
};

export interface DataTableProps<R extends DataTableRow>
  extends HTMLAttributes<HTMLDivElement> {
  readonly columns: Column<R>[];
  readonly rows: R[];
  readonly emptyLabel?: string;
  readonly isLoading?: boolean;
  readonly loadingLabel?: string;
  readonly isError?: boolean;
  readonly errorLabel?: string;
  readonly sort?: "ASC" | "DESC";
  readonly onSortChange?: (sort: "ASC" | "DESC") => void;
  readonly isSortable?: boolean;
  readonly filters?: Record<string, string>;
  readonly onFiltersChange?: (filters: Record<string, string>) => void;
  readonly withReloadButton?: boolean;
  readonly onReload?: () => void;
}

export default function DataTable<R extends DataTableRow>({
  className,
  rows,
  columns: columnDefs,
  filters,
  onFiltersChange,
  isSortable,
  sort,
  onSortChange,
  emptyLabel,
  isLoading,
  loadingLabel,
  isError,
  errorLabel,
  withReloadButton,
  onReload,
}: DataTableProps<R>) {
  const filterOptions = useMemo(() => {
    return columnDefs
      .filter((col) => col.filtrable)
      .flatMap((col) => {
        const filterKeys = col.filterKeys || [
          { key: col.key, label: col.title || col.key },
        ];
        return filterKeys.map((filterKey) => ({
          label: filterKey.label,
          key: filterKey.key,
          options: [...new Set(rows.map((row) => row.data[filterKey.key]))].map(
            (value) => {
              const renderedValue =
                col.renderFilter?.(value, filterKey.key) || value;
              let optionValue = renderedValue;
              if (filterKey.externalKey) {
                const row = rows.find(
                  (row) => row.data[filterKey.key] === value,
                );
                optionValue = row?.data[filterKey.externalKey] || value;
              }
              return {
                label: renderedValue,
                value: optionValue,
              };
            },
          ),
        }));
      });
  }, [columnDefs, rows]);

  const filteredRows = useMemo(() => {
    if (!filters) return rows;
    return rows.filter((row) => {
      return Object.entries(filters).every(([key, value]) => {
        const col = columnDefs.find(
          (col) =>
            col.key === key ||
            col.filterKeys?.find((filterKey) => filterKey.key === key),
        );
        if (!col || !value) return true;
        const filterKeys = col.filterKeys || [
          { key: col.key, label: col.title || col.key },
        ];
        const filterKey = filterKeys.find((filterKey) => filterKey.key === key);
        if (!filterKey || filterKey.external) return true;
        return (
          col.filterFn?.(row.data, value, key) ||
          row.data[filterKey.key] === value
        );
      });
    });
  }, [filters, rows, columnDefs]);

  const isReady = (filteredRows?.length || !isLoading) && !isError;
  const isRefreshing = isLoading && !!filteredRows.length;
  return (
    <>
      {isSortable && (
        <div className="flex items-end justify-items-end">
          {withReloadButton && (
            <Button onClick={onReload} title="Rafraichir" type="cancel" />
          )}
          {isRefreshing && (
            <Loader label={loadingLabel || "Actualisation en cours...."} />
          )}
          <SortOption sort={sort || "DESC"} onChange={onSortChange} />
        </div>
      )}
      {!!filterOptions?.length && (
        <div className="flex gap-2">
          <div className="flex items-center flex-nowrap gap-2 text-sm leading-5 font-medium whitespace-nowrap">
            <HiFilter className="text-gray-400" size={20} /> Filter par :
          </div>
          {filterOptions.map((filter) => (
            <Select
              className="w-full mx-1"
              key={filter.label}
              placeholder={filter.label}
              isClearable
              // @ts-ignore
              value={filter.options.find(
                (option) => option.value === filters?.[filter.key],
              )}
              options={filter.options}
              onChange={(option) =>
                onFiltersChange?.({
                  ...filters,
                  [filter.key]: option?.value || "",
                })
              }
            />
          ))}
        </div>
      )}
      <div>
        {!isSortable && isRefreshing && (
          <Loader label={loadingLabel || "Actualisation en cours...."} />
        )}
        <table className={cx("w-full table-auto ", className)}>
          <thead>
            <tr className="text-xs leading-5 font-medium uppercase text-gray-500 bg-gray-50 cursor-auto">
              {columnDefs.map((column) => (
                <th key={column.key} className="py-2 px-4">
                  {column.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {isLoading && !filteredRows.length && (
              <tr className="cursor-auto">
                <td colSpan={columnDefs.length} className="py-3 px-4">
                  <Loader label={loadingLabel} />
                </td>
              </tr>
            )}
            {isError && (
              <tr className="cursor-auto">
                <td
                  colSpan={columnDefs.length}
                  className="py-3 px-4 text-red-800"
                >
                  {errorLabel ||
                    "Une erreur est survenue lors du chargement des données..."}
                </td>
              </tr>
            )}
            {isReady && filteredRows.length === 0 && (
              <tr className="cursor-auto">
                <td colSpan={columnDefs.length} className="py-3 px-4">
                  {emptyLabel || "Aucun résultat"}
                </td>
              </tr>
            )}
            {isReady &&
              filteredRows.map((row) => (
                <tr key={row.id} className="cursor-auto">
                  {columnDefs.map((column) => (
                    <td key={column.key} className="py-3 px-4">
                      <div className="flex">
                        {column.renderCell
                          ? column.renderCell(row.data, row)
                          : row.data[column.key]}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
