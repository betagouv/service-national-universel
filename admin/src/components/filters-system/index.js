export { default as ResultTable } from "./components/ResultTable.js";
export { default as Filters } from "./components/Filters.js";

export const getDefaultQuery = () => {
  return {
    query: { bool: { must: [{ match_all: {} }] } },
  };
};
