import React, { useState } from "react";
import { useSelector } from "react-redux";

import { toastr } from "react-redux-toastr";
import { canDeleteStructure, translate } from "snu-lib";
import Bin from "@/assets/Bin";
import API from "@/services/api";
import ModalConfirmDelete from "../../centersV2/components/ModalConfirmDelete";
import { useHistory } from "react-router-dom";

export default function Actions({ structure }) {
  const user = useSelector((state) => state.Auth.user);
  const [isOpen, setIsOpen] = useState(false);
  const history = useHistory();

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
    <div className="space-y-7 pr-8 pt-8">
      {canDeleteStructure(user, structure) && (
        <button
          className="mb-auto ml-auto flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-[6px] border-[1px] border-solid border-[transparent] bg-[#FFFFFF] px-3 py-1.5 text-xs text-[#1F2937] hover:border-[#D1D5DB]"
          onClick={() => setIsOpen(true)}>
          <Bin fill="red" className="h-3" />
          <p>Supprimer</p>
        </button>
      )}
      <ModalConfirmDelete
        isOpen={isOpen}
        onCancel={() => setIsOpen(false)}
        onDelete={onConfirmDelete}
        title="Êtes-vous sûr(e) de vouloir supprimer cette structure ?"
        message="Cette action est irréversible."
        mention={"Attention, tous les responsables associés à cette structure seront définitivement supprimés."}
      />
    </div>
  );
}
