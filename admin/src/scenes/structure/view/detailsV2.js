import React from "react";
import { useSelector } from "react-redux";
import { ROLES } from "../../../utils";

import { Title } from "../../centersV2/components/commons";
import Menu from "../components/Menu";
import Informations from "../components/Informations";
import CardContacts from "../components/cards/CardContacts";
import CardRepresentant from "../components/cards/CardRepresentant";

export default function DetailsView({ structure }) {
  const user = useSelector((state) => state.Auth.user);

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
      <section className="flex mx-8 gap-4">
        <CardRepresentant structure={structure} />
        <CardContacts structure={structure} />
      </section>
      <Informations structure={structure} />
    </>
  );
}
