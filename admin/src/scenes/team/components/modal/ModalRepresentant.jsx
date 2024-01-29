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
        <div className="flex items-center justify-center text-sm text-gray-500">Contrat d’engagement</div>
        <div className="mx-8 my-4 flex flex-row items-center rounded-lg bg-blue-50 py-3 px-2">
          <HiInformationCircle className="h-8 w-8 pr-2 text-blue-400" />
          <div className="text-sm text-blue-800">Attention les contrats envoyés et signés ne seront pas impactés par cette modification.</div>
        </div>
        <div className="mx-8 mb-4 grid grid-cols-2 gap-4">
          <div className={`rounded-lg border-[1px]  py-1 px-2 ${isLoading && "bg-gray-200"}`}>
            <label htmlFor="firstName" className="w-full text-left text-gray-500">
              Prénom
            </label>
            <input required disabled={isLoading} className="w-full disabled:bg-gray-200" name="firstName" id="firstName" onChange={handleChange} value={data.firstName} />
          </div>
          <div className={`rounded-lg border-[1px]   py-1 px-2 ${isLoading && "bg-gray-200"}`}>
            <label htmlFor="lastName" className="w-full text-left text-gray-500">
              Nom
            </label>
            <input required disabled={isLoading} className="w-full disabled:bg-gray-200" name="lastName" id="lastName" onChange={handleChange} value={data.lastName} />
          </div>

          <div className={`rounded-lg border-[1px]  py-1 px-2 ${isLoading && "bg-gray-200"}`}>
            <label htmlFor="mobile" className="w-full text-left text-gray-500">
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
          <div className={`rounded-lg border-[1px]  py-1 px-2 ${isLoading && "bg-gray-200"}`}>
            <label htmlFor="email" className="w-full text-left text-gray-500">
              Adresse email
            </label>
            <input required disabled={isLoading} className="w-full disabled:bg-gray-200" name="email" id="email" onChange={handleChange} value={data.email} />
          </div>

          <div className={`rounded-lg border-[1px] py-1 px-2 ${isLoading && "bg-gray-200"}`}>
            <label htmlFor="role" className="w-full text-left text-gray-500">
              Rôle
            </label>
            <input required disabled={isLoading} className="w-full disabled:bg-gray-200" name="role" id="role" onChange={handleChange} value={data.role} />
          </div>
        </div>
        <div className="mt-4 mb-4 flex flex-row w-[55%] mx-auto justify-center">
          <ModalButton onClick={onCancel}>Annuler</ModalButton>
          <ModalButton disabled={isLoading} type="submit" newPrimary>
            Enregistrer
          </ModalButton>
        </div>
      </form>
    </ModalForm>
  );
}
