import React, { useContext } from "react";
import { StructureContext } from ".";
import Badge from "../../../components/Badge";
import Actions from "../components/Actions";
import Menu from "../components/Menu";

export default function Wrapper({ tab, children }) {
  const { structure } = useContext(StructureContext);

  if (!structure) return null;
  return (
    <>
      <div className="flex justify-between border-bottom">
        <div>
          <div className="flex items-center justify-between m-8">
            <h1 className="text-2xl font-bold leading-6 m-0">{structure.name}</h1>
            {structure.isMilitaryPreparation === "true" && <Badge text="Préparation Militaire" />}
          </div>
          <Menu tab={tab} />
        </div>
        {tab === "details" && <Actions />}
      </div>
      <main className="m-8">{children}</main>
    </>
  );
}
