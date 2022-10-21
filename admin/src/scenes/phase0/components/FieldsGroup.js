import React from "react";
import { MiniTitle } from "./commons";

export function FieldsGroup({ title, className = "", children, noflex }) {
  return (
    <div className={className}>
      {title && <MiniTitle>{title}</MiniTitle>}
      <div className={`${noflex ? "" : "flex items center"}`}>{children}</div>
    </div>
  );
}
