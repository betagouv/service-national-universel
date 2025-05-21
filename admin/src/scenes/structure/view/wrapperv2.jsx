import React from "react";
import Badge from "../../../components/Badge";
import HeaderButtons from "../components/HeaderButtons";
import Menu from "../components/Menu";

export default function Wrapper({ tab, structure, children, actionButton }) {
  if (!structure) return null;
  return (
    <div className="block w-full">
      <div className="border-bottom flex justify-between">
        <div className="w-full">
          <div className="m-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="m-0 text-2xl font-bold leading-6">{structure.name}</h1>
              {structure.isMilitaryPreparation === "true" && <Badge text="Préparation Militaire" />}
            </div>
            {actionButton}
          </div>
          <Menu tab={tab} structure={structure} />
        </div>
        {tab === "details" && <HeaderButtons structure={structure} />}
      </div>
      <main className="mx-8 mt-6 mb-16">{children}</main>
    </div>
  );
}
