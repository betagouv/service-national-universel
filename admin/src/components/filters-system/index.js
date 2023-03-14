//base
export { default as ResultTable } from "./components/ResultTable.js";
export { default as Filters } from "./components/Filters.js";
export { default as Save } from "./components/Save";
export { default as SelectedFilters } from "./components/SelectedFilters";
export { default as SortOptionComponent } from "./components/SortOptionComponent";

// export
export { default as ExportXlsxV2 } from "./components/export/ExportXlsxV2.js";
export { default as ModalExportV2 } from "./components/export/ModalExportV2.js";

export const getDefaultQuery = () => {
  return {
    query: { bool: { must: [{ match_all: {} }] } },
  };
};
