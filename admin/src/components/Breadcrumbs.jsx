import React from "react";
import { Breadcrumbs as BreadcrumbsDS } from "@snu/ds/admin";

export default function Breadcrumbs({ items }) {
  return (
    <div className="ml-8 mt-8 flex items-center gap-3">
      <BreadcrumbsDS items={[...items]} />
    </div>
  );
}
