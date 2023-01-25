import React, { useState } from "react";
import { toastr } from "react-redux-toastr";
import { Link } from "react-router-dom";
import { translate } from "snu-lib";
import API from "../../../services/api";
import ModalConfirmDelete from "../../centersV2/components/ModalConfirmDelete";
import Bin from "../../../assets/Bin";

export default function Menu({ id }) {
  const tabs = [
    { label: "Détails", src: `/structure/${id}` },
    { label: "Missions", src: `/structure/${id}/missions` },
    { label: "Historique", src: `/structure/${id}/historic` },
  ];
  const activeTab = tabs.find((tab) => tab.src === window.location.pathname);
  const [isOpen, setIsOpen] = useState(false);

  const onConfirmDelete = async () => {
    try {
      const { ok, code } = await API.remove(`/structure/${id}`);
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
    <div className="flex justify-between items-center border-bottom my-4">
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
        <button
          className="flex items-center justify-center whitespace-nowrap px-3 py-2 cursor-pointer bg-[#FFFFFF] text-[#1F2937] border-[transparent] border-[1px] border-solid rounded-[6px] hover:border-[#D1D5DB] gap-2 mb-auto ml-auto"
          onClick={() => setIsOpen(true)}>
          <Bin fill="red" />
          <p>Supprimer</p>
        </button>
        <button
          className="flex items-center justify-center whitespace-nowrap px-3 py-2 cursor-pointer bg-[#FFFFFF] text-[#1F2937] border-[transparent] border-[1px] border-solid rounded-[6px] hover:border-[#D1D5DB] gap-2 mb-auto ml-auto"
          onClick={() => setIsOpen(true)}>
          <Bin fill="red" />
          <p>Supprimer</p>
        </button>
      </nav>
    </div>
  );
}
