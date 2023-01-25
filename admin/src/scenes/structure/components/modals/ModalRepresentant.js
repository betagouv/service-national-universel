import React, { useContext, useState } from "react";
import { Footer } from "../../../../components/modals/Modal";
import ModalForm from "../../../../components/modals/ModalForm";
import ModalButton from "../../../../components/buttons/ModalButton";
import { HiInformationCircle, HiOutlineTrash } from "react-icons/hi";
import { StructureContext } from "../../view";

export default function ModalRepresentant({ isOpen, setIsOpen, onSubmit, onDelete }) {
  const { structure } = useContext(StructureContext);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState(structure.structureManager || {});

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

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

  return (
    <ModalForm isOpen={isOpen} headerText={`Représentant de la structure ${structure.name}`} onCancel={() => setIsOpen(false)} classNameModal="max-w-3xl">
      <form className="w-full" onSubmit={handleSubmit}>
        <p className="text-gray-500 text-sm mx-8 my-4">
          Dans le cadre du contrat d’engagement préalable à l’engagement d’un volontaire, vous pouvez préciser le signataire de l’ensemble des contrats et sa fonction au sein de
          votre structure.
        </p>
        <div className="flex flex-row items-center bg-blue-50 rounded-lg mx-8 my-4 py-3 px-2">
          <HiInformationCircle className="text-blue-400 pr-2 h-8 w-8" />
          <div className="text-blue-800 text-sm">Attention les contrats envoyés et signés ne seront pas impactés par cette modification.</div>
        </div>
        <div className="grid grid-cols-2 gap-4 mx-8 mb-4">
          <div className={`border-[1px] rounded-lg  py-1 px-2 ${isLoading && "bg-gray-200"}`}>
            <label htmlFor="firstName" className="text-left text-gray-500 w-full">
              Prénom
            </label>
            <input required disabled={isLoading} className="w-full disabled:bg-gray-200" name="firstName" id="firstName" onChange={handleChange} value={data.firstName} />
          </div>
          <div className={`border-[1px] rounded-lg   py-1 px-2 ${isLoading && "bg-gray-200"}`}>
            <label htmlFor="lastName" className="text-left text-gray-500 w-full">
              Nom
            </label>
            <input required disabled={isLoading} className="w-full disabled:bg-gray-200" name="lastName" id="lastName" onChange={handleChange} value={data.lastName} />
          </div>

          <div className={`border-[1px] rounded-lg  py-1 px-2 ${isLoading && "bg-gray-200"}`}>
            <label htmlFor="mobile" className="text-left text-gray-500 w-full">
              Téléphone
            </label>
            <input
              required
              type="tel"
              pattern="\d*"
              disabled={isLoading}
              className="w-full disabled:bg-gray-200"
              name="mobile"
              id="mobile"
              onChange={handleChange}
              value={data.mobile}
            />
          </div>
          <div className={`border-[1px] rounded-lg  py-1 px-2 ${isLoading && "bg-gray-200"}`}>
            <label htmlFor="email" className="text-left text-gray-500 w-full">
              Adresse email
            </label>
            <input required disabled={isLoading} className="w-full disabled:bg-gray-200" name="email" id="email" onChange={handleChange} value={data.email} />
          </div>

          <div className={`border-[1px] rounded-lg py-1 px-2 ${isLoading && "bg-gray-200"}`}>
            <label htmlFor="role" className="text-left text-gray-500 w-full">
              Rôle
            </label>
            <input required disabled={isLoading} className="w-full disabled:bg-gray-200" name="role" id="role" onChange={handleChange} value={data.role} />
          </div>
          <div className="h-full flex flex-col items-end">
            <button disabled={isLoading} className="my-auto border-b-[1px] border-b-transparent hover:border-red-500" type="button" onClick={handleDelete}>
              <div className="w-full flex flex-row justify-center items-center text-red-500">
                <HiOutlineTrash className="text-red-300 text-lg mr-2" />
                Supprimer le contact
              </div>
            </button>
          </div>
        </div>
        <Footer>
          <ModalButton disabled={isLoading} type="submit" primary>
            Enregistrer
          </ModalButton>
          <ModalButton onClick={() => setIsOpen(false)}>Annuler</ModalButton>
        </Footer>
      </form>
    </ModalForm>
  );
}
