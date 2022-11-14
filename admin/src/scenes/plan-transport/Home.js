import React from "react";
import Breadcrumbs from "../../components/Breadcrumbs";
import Title from "./components/commons";
import { BorderButton } from "./components/Buttons";

export default function Home() {
  return (
    <div>
      <Breadcrumbs items={[{ label: "Plan de transport" }]} />
      <div className="p-[30px]">
        <Title>Plan de transport</Title>
        <ul className="mt-[30px] list-none">
          <li>
            <BorderButton to="/plan-de-transport/tableau-repartition" className="mb-[8px]">
              Tableau de répartition
            </BorderButton>
          </li>
          <li>
            <BorderButton to="/plan-de-transport/schema-repartition" className="mb-[8px]">
              Schéma de répartition
            </BorderButton>
          </li>
        </ul>
      </div>
    </div>
  );
}
