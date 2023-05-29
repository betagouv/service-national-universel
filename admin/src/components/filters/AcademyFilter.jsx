import React from "react";
import { MultiDropdownList } from "@appbaseio/reactivesearch";

export const AcademyFilter = ({ defaultQuery, filters, dataField = "academy.keyword", ...rest }) => (
  <MultiDropdownList
    defaultQuery={defaultQuery}
    className="dropdown-filter"
    placeholder="Académie"
    componentId="ACADEMY"
    dataField={dataField}
    title=""
    react={{ and: filters.filter((e) => e !== "ACADEMY") }}
    URLParams={true}
    sortBy="asc"
    showSearch={true}
    searchPlaceholder="Rechercher..."
    {...rest}
  />
);
