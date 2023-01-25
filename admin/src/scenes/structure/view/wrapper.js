import React, { useContext, useState } from "react";
import { useSelector } from "react-redux";

import { ROLES } from "../../../utils";
import Badge from "../../../components/Badge";
import ModalConfirm from "../../../components/modals/ModalConfirm";
import { StructureContext } from ".";
import Menu from "../components/Menu";

export default function Wrapper({ children, tab }) {
  const { structure } = useContext(StructureContext);
  const user = useSelector((state) => state.Auth.user);
  const [modal, setModal] = useState({ isOpen: false, onConfirm: null });

  if (!structure) return null;
  return (
    <div style={{ flex: tab === "missions" ? "0%" : 2, position: "relative" }}>
      <header className="flex items-center justify-between mx-8 my-4">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold leading-6 m-0">{structure.name}</h1>
          {structure.isMilitaryPreparation === "true" && <Badge text="Préparation Militaire" />}
        </div>
        {user.role !== ROLES.RESPONSIBLE && structure.status !== "DRAFT" && (
          <a
            className="px-3 py-2 cursor-pointer border-[1px] rounded-lg bg-blue-600 border-blue-600 text-[#ffffff] hover:bg-white hover:text-[#2563eb]"
            href={"/mission/create/" + structure._id}>
            Nouvelle mission
          </a>
        )}
      </header>
      <Menu tab={tab} />
      <div className="m-8">{children}</div>
      <ModalConfirm
        isOpen={modal?.isOpen}
        title={modal?.title}
        message={modal?.message}
        onCancel={() => setModal({ isOpen: false, onConfirm: null })}
        onConfirm={() => {
          modal?.onConfirm();
          setModal({ isOpen: false, onConfirm: null });
        }}
      />
    </div>
  );
}
