import React from "react";
import Title from "../components/commons";
import Breadcrumbs from "../../../components/Breadcrumbs";

export default function TableauRepartition() {
  return (
    <div>
      <Breadcrumbs items={[{ label: "Plan de transport", to: "/plan-de-transport" }, { label: "Tableau de répartition" }]} />
      <div className="p-[30px]">
        <Title>Tableau de répartition</Title>
      </div>
    </div>
  );
}
