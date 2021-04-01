import React from "react";
import { MultiDropdownList } from "@appbaseio/reactivesearch";
import { getDepartmentNumber } from "../../utils";

export const DepartmentFilter = ({ defaultQuery, filters, ...rest }) => (
  <MultiDropdownList
    defaultQuery={defaultQuery}
    className="dropdown-filter"
    placeholder="Départements"
    componentId="DEPARTMENT"
    dataField="department.keyword"
    title=""
    react={{ and: filters.filter((e) => e !== "DEPARTMENT") }}
    URLParams={true}
    sortBy="asc"
    showSearch={true}
    searchPlaceholder="Rechercher..."
    renderItem={(e, count) => {
      return `${getDepartmentNumber(e)} - ${e} (${count})`;
    }}
    {...rest}
  />
);
