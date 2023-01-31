import React, { useContext, useState } from "react";
import { HiOutlineTrash } from "react-icons/hi";
import { StructureContext } from "../../view";

import Warning from "../../../../assets/icons/Warning";
import ModalTailwind from "../../../../components/modals/ModalTailwind";
import Button from "../Button";
import Field from "../../../missions/components/Field";
import ModalConfirmDelete from "../../../centersV2/components/ModalConfirmDelete";

export default function ModalRepresentant({ isOpen, setIsOpen, onSubmit, onDelete }) {
  const { structure } = useContext(StructureContext);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState(structure.structureManager || {});
  const [modalDelete, setModalDelete] = useState({ isOpen: false });

  const handleChange = (e) => setData({ ...data, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    setIsLoading(true);
    await onSubmit(data);
    setIsLoading(false);
  };

  const handleDelete = async () => {
    setModalDelete({
      isOpen: true,
      title: "Supprimer le représentant",
      message: "Êtes-vous sûr de vouloir supprimer les informations de ce représentant de structure ?",
      onDelete: onDelete,
    });
  };

  const handleCancel = () => {
    setData(structure.structureManager || {});
    setIsOpen(false);
  };

  return (
    <>
      <ModalTailwind isOpen={isOpen} onClose={() => setIsOpen(false)} className="bg-white rounded-xl w-[800px] h-[500px] px-8 py-7 flex flex-col gap-4">
        <p className="text-lg font-medium text-center">Représentant de la structure</p>
        <p className="text-gray-500 text-sm text-center">
          Dans le cadre du contrat d’engagement préalable à l’engagement d’un volontaire, vous pouvez préciser le signataire de l’ensemble des contrats et sa fonction au sein de
          votre structure.
        </p>
        <div className="flex items-center bg-blue-50 rounded-lg p-3 gap-2">
          <Warning className="text-blue-400 h-5 w-5" />
          <div className="text-blue-800 text-sm">Attention : les contrats envoyés et signés ne seront pas impactés par cette modification.</div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Prénom" name="firstName" value={data.firstName} handleChange={handleChange} />
          <Field label="Nom" name="lastName" value={data.lastName} handleChange={handleChange} />
          <Field label="Téléphone" name="mobile" value={data.mobile} handleChange={handleChange} />
          <Field label="Adresse email" name="email" value={data.email} handleChange={handleChange} />
          <Field label="Rôle" name="role" value={data.role} handleChange={handleChange} />
          <div className="h-full flex flex-col items-end">
            <button disabled={isLoading} className="bg-[#ffffff] hover:bg-[#fef2f2] text-red-500 px-4 py-2 rounded-lg transition mt-auto" onClick={handleDelete}>
              <div className="w-full flex justify-center items-center gap-2">
                <HiOutlineTrash className="text-lg" />
                Supprimer le contact
              </div>
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-auto">
          <Button onClick={handleCancel} disabled={isLoading} category="tertiary">
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading || !data.firstName || !data.lastName || !data.mobile || !data.email}>
            Enregistrer
          </Button>
        </div>
      </ModalTailwind>
      <ModalConfirmDelete
        isOpen={modalDelete.isOpen}
        title={modalDelete.title}
        message={modalDelete.message}
        onCancel={() => setModalDelete({ isOpen: false })}
        onDelete={() => {
          setModalDelete({ isOpen: false });
          setIsLoading(true);
          modalDelete.onDelete();
          setIsLoading(false);
        }}
      />
    </>
  );
}
