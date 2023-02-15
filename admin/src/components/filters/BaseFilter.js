import React, { Children } from "react";

export const BaseFilter = ({ children, defaultQuery, filters, dataField = "region.keyword", visible, ...rest }) => {
  return <div className={`${!visible && "hidden"}`}>{children}</div>;
};
