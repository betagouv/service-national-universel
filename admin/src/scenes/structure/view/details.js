import React, { useState } from "react";
import { useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";
import { ROLES, translate } from "../../../utils";
import { deleteReferent, getReferents, inviteReferent, updateReferent } from "../structureUtils";

import { Title } from "../../../components/commons";
import Menu from "../components/Menu";
import Informations from "../components/Informations";
import CardContacts from "../components/cards/CardContacts";

export default function DetailsView({ structure }) {
  // const [referents, setReferents] = useState([]);
  const [modal, setModal] = useState({ isOpen: false, onConfirm: null });
  const [modalTutor, setModalTutor] = useState({ isOpen: false, onConfirm: null });
  const [modalReferentDeleted, setModalReferentDeleted] = useState({ isOpen: false });
  const user = useSelector((state) => state.Auth.user);

  const onClickDelete = (target) => {
    setModal({
      isOpen: true,
      onConfirm: () => onConfirmDelete(target),
      title: `Êtes-vous sûr(e) de vouloir supprimer le profil de ${target.firstName} ${target.lastName} ?`,
      message: "Cette action est irréversible.",
    });
  };

  const onDeleteTutorLinked = (target) => {
    setModalTutor({
      isOpen: true,
      value: target,
      onConfirm: () => onConfirmDelete(target),
    });
  };

  const onReferentDeleted = () => {
    setModalReferentDeleted({
      isOpen: true,
    });
  };

  const onConfirmDelete = async (target) => {
    const { ok, code } = await deleteReferent(target._id);
    if (ok) {
      toastr.success("Succès", "Le référent a bien été supprimé");
      // getReferents();
    } else {
      toastr.error("Erreur", translate(code));
    }
  };

  if (!structure) return <div />;
  return (
    <>
      <header className="flex items-center justify-between mx-8 my-6">
        <Title>{structure.name}</Title>
        {user.role !== ROLES.RESPONSIBLE && structure?.status !== "DRAFT" && (
          <a
            className="inline-flex items-center justify-center whitespace-nowrap px-3 py-2 cursor-pointer border-[1px] border-solid rounded-[6px] bg-blue-600 text-white border-blue-600 hover:bg-white hover:text-black"
            href={"/mission/create/" + structure._id}>
            Nouvelle mission
          </a>
        )}
      </header>
      <Menu id={structure._id} />
      <section className="flex mx-8 gap-4">
        <div className="bg-white rounded-lg overflow-hidden px-4 py-2 shadow-lg">Représentant de la structure</div>
        <CardContacts
          structure={structure}
          getContacts={() => getReferents(structure._id)}
          createContact={inviteReferent}
          updateContact={updateReferent}
          deleteContact={deleteReferent}
        />
      </section>
      <Informations structure={structure} />
    </>
  );
}
