import React from "react";
import Example from "./example";

import FromDate from "./FromDate";
import ToDate from "./ToDate";

export function getCustomComponent(component, setQuery, selectedFilters) {
  switch (component) {
    case "example":
      return <Example />;
    case "fromDate":
      return <FromDate setQuery={setQuery} value={selectedFilters?.filter} />;
    case "toDate":
      return <FromDate setQuery={setQuery} value={selectedFilters?.filter} />;
    default:
      return null;
  }
}
