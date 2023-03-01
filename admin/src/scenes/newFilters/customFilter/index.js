import React from "react";
import Example from "./example";
import DatePickerWrapper from "./DatePickerWrapper";

import FromDate from "./FromDate";
import ToDate from "./ToDate";

export function getCustomComponent(component, setQuery, selectedFilters) {
  switch (component) {
    case "example":
      return <Example />;
    case "fromDate":
      return <FromDate setQuery={setQuery} value={selectedFilters?.filter?.value} />;
    case "toDate":
      return <ToDate setQuery={setQuery} value={selectedFilters?.filter?.value} />;
    default:
      return null;
  }
}
