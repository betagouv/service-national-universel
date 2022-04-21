import React, { useEffect, useState } from "react";
import { Footer } from "../../../../components/modals/Modal";
import ModalForm from "../../../../components/modals/ModalForm";
import ModalButton from "../../../../components//buttons/ModalButton";
import { HiInformationCircle } from "react-icons/hi";

export default function ModalRepresentant({ isOpen, setIsOpen, onSubmit, representant, department }) {
  const onCancel = () => setIsOpen(false);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState({});

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    if (representant) {
      setData({
        firstName: representant.firstName,
        lastName: representant.lastName,
        mobile: representant.mobile,
        email: representant.email,
        role: representant.role,
      });
    } else setData({});
  }, [representant]);

  const handleSubmit = async (e) => {
    setIsLoading(true);
    e.preventDefault();
    await onSubmit(data);
    setIsLoading(false);
  };

  return (
    <ModalForm isOpen={isOpen} headerText={`Représentant de l’État ${department}`} onCancel={onCancel} classNameModal="max-w-3xl">
      <form className="w-full" onSubmit={handleSubmit}>
        <div className="flex items-center justify-center text-gray-500 text-sm">Contrat d’engagement</div>
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
            <input required disabled={isLoading} className="w-full disabled:bg-gray-200" name="mobile" id="mobile" onChange={handleChange} value={data.mobile} />
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
        </div>
        <Footer>
          <ModalButton disabled={isLoading} type="submit" primary>
            Enregistrer
          </ModalButton>
          <ModalButton onClick={onCancel}>Annuler</ModalButton>
        </Footer>
      </form>
    </ModalForm>
  );
}
