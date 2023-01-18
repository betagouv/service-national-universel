import React, { useState } from "react";
import { toastr } from "react-redux-toastr";
import { Link } from "react-router-dom";
import { translate } from "snu-lib";
import API from "../../../services/api";
import ModalConfirmDelete from "../../centersV2/components/ModalConfirmDelete";
import Button from "../../missions/components/Button";
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
    <>
      <ModalConfirmDelete
        isOpen={isOpen}
        onCancel={() => setIsOpen(false)}
        onDelete={onConfirmDelete}
        title="Êtes-vous sûr(e) de vouloir supprimer cette structure ?"
        message="Cette action est irréversible."
      />
      <div className="flex justify-between items-center border-bottom my-6">
        <nav className="flex items-center gap-10 w-full mx-8">
          {tabs.map((tab) => (
            <Link key={tab.label} to={tab.src} className={`pb-4 cursor-pointer ${activeTab.label === tab.label && "text-blue-600 border-b-2 border-blue-600"}`}>
              {tab.label}
            </Link>
          ))}
          <Button icon={<Bin fill="red" />} onClick={() => setIsOpen(true)} className="mb-auto ml-auto">
            Supprimer
          </Button>
        </nav>
      </div>
    </>
  );
}
