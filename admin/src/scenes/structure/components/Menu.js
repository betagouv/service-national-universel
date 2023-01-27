import React, { useContext, useState } from "react";
import { toastr } from "react-redux-toastr";
import { Link } from "react-router-dom";
import { canDeleteStructure, canViewPatchesHistory, ROLES, translate } from "snu-lib";
import API from "../../../services/api";
import ModalConfirmDelete from "../../centersV2/components/ModalConfirmDelete";
import Bin from "../../../assets/Bin";
import { StructureContext } from "../view";
import { useSelector } from "react-redux";

export default function Menu({ tab }) {
  const { structure } = useContext(StructureContext);
  const user = useSelector((state) => state.Auth.user);
  const tabs = [
    { label: "Détails", value: "details", src: `/structure/${structure._id}` },
    { label: "Missions", value: "missions", src: `/structure/${structure._id}/missions` },
  ];
  if (canViewPatchesHistory(user)) {
    tabs.push({ label: "Historique", value: "historique", src: `/structure/${structure._id}/historique` });
  }
  const activeTab = tabs.find((e) => e.value === tab);
  const [isOpen, setIsOpen] = useState(false);

  const onConfirmDelete = async () => {
    try {
      const { ok, code } = await API.remove(`/structure/${structure._id}`);
      if (!ok && code === "OPERATION_UNAUTHORIZED") return toastr.error("Vous n'avez pas les droits pour effectuer cette action");
      if (!ok && code === "LINKED_OBJECT") return toastr.error("Cette structure a des candidatures sur une de ses missions");
      if (!ok) return toastr.error("Une erreur s'est produite :", translate(code));
      toastr.success("Cette structure a été supprimée.");
      return history.push(`/structure`);
    } catch (e) {
      console.log(e);
      return toastr.error("Oups, une erreur est survenue pendant la supression de la structure :", translate(e.code));
    }
  };

  return (
    <div className="flex justify-between items-center border-bottom">
      <ModalConfirmDelete
        isOpen={isOpen}
        onCancel={() => setIsOpen(false)}
        onDelete={onConfirmDelete}
        title="Êtes-vous sûr(e) de vouloir supprimer cette structure ?"
        message="Cette action est irréversible."
      />
      <nav className="flex items-center gap-10 w-full mx-8 text-gray-500">
        {tabs.map((tab) => (
          <Link key={tab.label} to={tab.src} className={`pb-4 cursor-pointer ${activeTab.label === tab.label && "text-blue-600 border-b-2 border-blue-600"}`}>
            {tab.label}
          </Link>
        ))}
        {tab === "details" && canDeleteStructure(user, structure) && (
          <button
            className="flex items-center justify-center whitespace-nowrap px-3 py-2 cursor-pointer bg-[#FFFFFF] text-[#1F2937] border-[transparent] border-[1px] border-solid rounded-[6px] hover:border-[#D1D5DB] gap-2 mb-auto ml-auto"
            onClick={() => setIsOpen(true)}>
            <Bin fill="red" />
            <p>Supprimer</p>
          </button>
        )}
      </nav>
    </div>
  );
}
