import React from "react";
import { MultiDropdownList } from "@appbaseio/reactivesearch";

export const RegionFilter = ({ defaultQuery, filters, dataField = "region.keyword", ...rest }) => (
  <MultiDropdownList
    defaultQuery={defaultQuery}
    className="dropdown-filter"
    placeholder="Régions"
    componentId="REGION"
    dataField={dataField}
    title=""
    react={{ and: filters.filter((e) => e !== "REGION") }}
    URLParams={true}
    sortBy="asc"
    showSearch={true}
    searchPlaceholder="Rechercher..."
    {...rest}
  />
);
