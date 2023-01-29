import React, { useContext, useState } from "react";
import { HiInformationCircle, HiOutlineTrash } from "react-icons/hi";
import { StructureContext } from "../../view";
import ModalTailwind from "../../../../components/modals/ModalTailwind";

export default function ModalRepresentant({ isOpen, setIsOpen, onSubmit, onDelete }) {
  const { structure } = useContext(StructureContext);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState(structure.structureManager || {});

  const handleChange = (e) => setData({ ...data, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    setIsLoading(true);
    e.preventDefault();
    await onSubmit(data);
    setIsLoading(false);
  };

  const handleDelete = async () => {
    setIsLoading(true);
    await onDelete();
    setIsOpen(false);
    setIsLoading(false);
  };

  const handleCancel = () => {
    setData(structure.structureManager || {});
    setIsOpen(false);
  };

  return (
    <ModalTailwind isOpen={isOpen} onClose={() => setIsOpen(false)} className="bg-white rounded-xl w-[800px] px-8 py-7 space-y-4">
      <p className="text-lg font-medium text-center">Représentant de la structure</p>
      <p className="text-gray-500 text-sm text-center">
        Dans le cadre du contrat d’engagement préalable à l’engagement d’un volontaire, vous pouvez préciser le signataire de l’ensemble des contrats et sa fonction au sein de
        votre structure.
      </p>
      <div className="flex flex-row items-center bg-blue-50 rounded-lg py-3 px-2">
        <HiInformationCircle className="text-blue-400 mx-2 h-8 w-8" />
        <div className="text-blue-800 text-sm">Attention : les contrats envoyés et signés ne seront pas impactés par cette modification.</div>
      </div>
      <form className="grid grid-cols-2 gap-4" onSubmit={handleSubmit}>
        <Field label="Prénom" name="firstName" data={data} onChange={handleChange} disabled={isLoading} />
        <Field label="Nom" name="lastName" data={data} onChange={handleChange} disabled={isLoading} />
        <Field label="Téléphone" name="mobile" data={data} onChange={handleChange} disabled={isLoading} />
        <Field label="Adresse email" name="email" data={data} onChange={handleChange} disabled={isLoading} />
        <Field label="Rôle" name="role" data={data} onChange={handleChange} disabled={isLoading} />
        <div className="h-full flex flex-col items-end">
          <button disabled={isLoading} className="my-auto border-b-[1px] border-b-transparent hover:border-red-500" type="button" onClick={handleDelete}>
            <div className="w-full flex flex-row justify-center items-center text-red-500">
              <HiOutlineTrash className="text-red-300 text-lg mr-2" />
              Supprimer le contact
            </div>
          </button>
        </div>
        <button className="border-[1px] rounded-lg border-grey-300 bg-[#ffffff] py-2 px-8 hover:bg-[#f9fafb]" onClick={handleCancel} disabled={isLoading}>
          Annuler
        </button>
        <button
          className="border-[1px] rounded-lg border-blue-600 bg-blue-600 shadow-sm py-2 px-8 text-white text-sm justify-center hover:opacity-90"
          type="submit"
          disabled={isLoading}>
          Enregistrer
        </button>
      </form>
    </ModalTailwind>
  );
}

const Field = ({ disabled, label, name, data, onChange, type = "text", required = true }) => (
  <div className={`border-[1px] rounded-lg py-2 px-3 ${disabled && "bg-gray-200"}`}>
    <label htmlFor="name" className="w-full m-0 text-left text-xs text-gray-500">
      {label}
    </label>
    <input required={required} disabled={disabled} className="disabled:bg-gray-200 w-full" name={name} id={name} onChange={onChange} value={data[name]} type={type} />
  </div>
);
