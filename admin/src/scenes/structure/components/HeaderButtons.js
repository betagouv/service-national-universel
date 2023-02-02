import React, { useContext, useState } from "react";
import { useSelector } from "react-redux";

import { ROLES } from "../../../utils";
import { StructureContext } from "../view";
import { canDeleteStructure, translate } from "snu-lib";
import ModalConfirmDelete from "../../centersV2/components/ModalConfirmDelete";
import { toastr } from "react-redux-toastr";
import API from "../../../services/api";
import Bin from "../../../assets/Bin";

export default function Actions() {
  const { structure } = useContext(StructureContext);
  const user = useSelector((state) => state.Auth.user);
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
    <div className="pr-8 pt-8 space-y-7">
      {user.role !== ROLES.RESPONSIBLE && structure.status !== "DRAFT" && (
        <a
          className="px-3 py-2 cursor-pointer rounded-lg bg-blue-600 text-blue-50 hover:brightness-110 hover:text-blue-50 active:brightness-125"
          href={"/mission/create/" + structure._id}>
          Nouvelle mission
        </a>
      )}
      {canDeleteStructure(user, structure) && (
        <button
          className="flex items-center justify-center whitespace-nowrap px-3 py-2 cursor-pointer bg-[#FFFFFF] text-[#1F2937] border-[transparent] border-[1px] border-solid rounded-[6px] hover:border-[#D1D5DB] gap-2 mb-auto ml-auto"
          onClick={() => setIsOpen(true)}>
          <Bin fill="red" />
          <p>Supprimer</p>
        </button>
      )}
      <ModalConfirmDelete
        isOpen={isOpen}
        onCancel={() => setIsOpen(false)}
        onDelete={onConfirmDelete}
        title="Êtes-vous sûr(e) de vouloir supprimer cette structure ?"
        message="Cette action est irréversible."
      />
    </div>
  );
}
