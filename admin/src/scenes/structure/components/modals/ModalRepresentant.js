import React, { useContext, useState } from "react";
import { StructureContext } from "../../view";
import validator from "validator";

import { HiOutlineTrash } from "react-icons/hi";
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
  const [errors, setErrors] = useState({});

  const handleChange = (e) => setData({ ...data, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    const errors = {};
    if (!data.firstName) errors.firstName = "Le prénom est obligatoire";
    if (!data.lastName) errors.lastName = "Le nom est obligatoire";
    if (!data.email) errors.email = "L'email est obligatoire";
    if (!validator.isEmail(data.email)) errors.email = "L'email n'est pas valide";
    if (!data.mobile) errors.mobile = "Le téléphone est obligatoire";
    if (!validator.matches(data.mobile, new RegExp(`([0-9]{8,11})`))) errors.mobile = "Le téléphone n'est pas valide (exemple : (+33)(0)642424242)";

    if (Object.keys(errors).length > 0) return setErrors(errors);
    setErrors({});

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
    setErrors({});
    setIsOpen(false);
  };

  return (
    <>
      <ModalTailwind isOpen={isOpen} onClose={() => setIsOpen(false)} className="bg-white rounded-xl w-[800px] min-h-[500px] px-8 py-7 flex flex-col gap-4">
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
          <Field label="Prénom" name="firstName" value={data.firstName} handleChange={handleChange} errors={errors} />
          <Field label="Nom" name="lastName" value={data.lastName} handleChange={handleChange} errors={errors} />
          <Field label="Téléphone" name="mobile" value={data.mobile} handleChange={handleChange} errors={errors} />
          <Field label="Adresse email" name="email" value={data.email} handleChange={handleChange} errors={errors} />
          <Field label="Rôle" name="role" value={data.role} handleChange={handleChange} errors={errors} />
          <div className="h-full flex flex-col items-end">
            {structure.structureManager && (
              <button disabled={isLoading} className="bg-[#ffffff] hover:bg-[#fef2f2] text-red-500 px-4 py-2 rounded-lg transition mt-auto" onClick={handleDelete}>
                <div className="w-full flex justify-center items-center gap-2">
                  <HiOutlineTrash className="text-lg" />
                  Supprimer le contact
                </div>
              </button>
            )}
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
