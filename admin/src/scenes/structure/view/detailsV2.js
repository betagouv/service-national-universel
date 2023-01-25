import React, { useContext } from "react";
import { useSelector } from "react-redux";
import { ROLES } from "../../../utils";

import { Title } from "../../centersV2/components/commons";
import Menu from "../components/Menu";
import Informations from "../components/Informations";
import { StructureContext } from ".";

export default function DetailsView() {
  const user = useSelector((state) => state.Auth.user);
  const { structure } = useContext(StructureContext);

  if (!structure) return <div />;
  return (
    <>
      <header className="flex items-center justify-between mx-8 my-6">
        <Title>{structure.name}</Title>
        {user.role !== ROLES.RESPONSIBLE && structure?.status !== "DRAFT" && (
          <a
            className="px-3 py-2 cursor-pointer border-[1px] rounded-lg bg-blue-600 border-blue-600 text-[#ffffff] hover:bg-white hover:text-[#2563eb]"
            href={"/mission/create/" + structure._id}>
            Nouvelle mission
          </a>
        )}
      </header>
      <Menu id={structure._id} />
      <section className="flex mx-8 gap-4">{/* Cartes */}</section>
      <main className="mx-8 mt-">
        <Informations />
      </main>
    </>
  );
}
