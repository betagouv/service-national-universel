import React, { useContext } from "react";
import { StructureContext } from ".";
import Badge from "../../../components/Badge";
import HeaderButtons from "../components/HeaderButtons";
import Menu from "../components/Menu";

export default function Wrapper({ tab, children }) {
  const { structure } = useContext(StructureContext);

  if (!structure) return null;
  return (
    <div className="block w-full">
      <div className="flex justify-between border-bottom">
        <div>
          <div className="flex items-center justify-between gap-4 m-8">
            <h1 className="text-2xl font-bold leading-6 m-0">{structure.name}</h1>
            {structure.isMilitaryPreparation === "true" && <Badge text="Préparation Militaire" />}
          </div>
          <Menu tab={tab} />
        </div>
        {tab === "details" && <HeaderButtons />}
      </div>
      <main className="m-8">{children}</main>
    </div>
  );
}
