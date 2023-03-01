import React from "react";
import Example from "./example";
import DatePickerWrapper from "./DatePickerWrapper";

export function getCustomComponent(component, setQuery, selectedFilters) {
  switch (component) {
    case "example":
      return <Example />;
    case "dateRange":
      return <DatePickerWrapper setQuery={setQuery} value={selectedFilters?.filter?.value} />;
    default:
      return null;
  }
}
