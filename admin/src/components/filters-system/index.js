//base
export { default as ResultTable } from "./components/ResultTable.js";
export { default as Filters } from "./components/Filters.js";

// export
export { default as ExportXlsxV2 } from "./components/export/ExportXlsxV2.js";
export { default as ModalExportV2 } from "./components/export/ModalExportV2.js";

// filters
export { default as Save } from "./components/filters/Save";
export { default as SelectedFilters } from "./components/filters/SelectedFilters";
export { default as SortOptionComponent } from "./components/filters/SortOptionComponent";

export const getDefaultQuery = () => {
  return {
    query: { bool: { must: [{ match_all: {} }] } },
  };
};
