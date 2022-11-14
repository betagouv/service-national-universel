import React from "react";
import Breadcrumbs from "../../../components/Breadcrumbs";

export default function SchemaRepartition() {
  return (
    <div>
      <Breadcrumbs items={[{ label: "Plan de transport", to: "/plan-de-transport" }, { label: "Schéma de répartition" }]} />
      <div className="p-[30px]">
        <div className="">Schema de répartition</div>
      </div>
    </div>
  );
}
