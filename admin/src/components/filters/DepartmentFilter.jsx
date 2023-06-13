import React from "react";
import { MultiDropdownList } from "@appbaseio/reactivesearch";
import { getDepartmentNumber } from "../../utils";

export const DepartmentFilter = ({ defaultQuery, filters, dataField = "department.keyword", ...rest }) => (
  <MultiDropdownList
    defaultQuery={defaultQuery}
    // transformData={(data) => {
    //   return data.map(({ key, doc_count }) => ({
    //     key: `${getDepartmentNumber(key)} ${key}`,
    //     doc_count,
    //   }));
    // }}
    className="dropdown-filter"
    placeholder="Départements"
    componentId="DEPARTMENT"
    dataField={dataField}
    title=""
    react={{ and: filters.filter((e) => e !== "DEPARTMENT") }}
    URLParams={true}
    sortBy="asc"
    showSearch={true}
    searchPlaceholder="Rechercher..."
    renderItem={(e, count) => {
      return `${getDepartmentNumber(e)} - ${e} (${count})`;
    }}
    size={150}
    {...rest}
  />
);
