import React, { useEffect } from "react";
import ModalForm from "../../../../components/modals/ModalForm";
import { IoMdClose } from "react-icons/io";
import { FaPlus } from "react-icons/fa";
import validator from "validator";

export default function ModalExportMail({ isOpen, onSubmit, onCancel }) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [emails, setEmails] = React.useState([]);
  const [value, setValue] = React.useState("");
  const [error, setError] = React.useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    await onSubmit(emails);
    setIsLoading(false);
  };

  const onClickCancel = (e) => {
    e.preventDefault();
    onCancel();
  };

  const handleEmail = (e = null) => {
    if (e) e.preventDefault();
    if (validator.isEmail(value)) {
      setEmails((prev) => [...prev, value]);
      setValue("");
      setError(false);
    } else {
      setError(true);
    }
  };

  return (
    <ModalForm isOpen={isOpen} onCancel={onCancel} showCloseIcon={false}>
      <div className="w-full">
        <div className="mx-4">
          <div className="flex items-center justify-center text-xl font-medium text-gray-900">Envoi par mail</div>
          <div className="flex items-center justify-center text-center text-sm font-normal text-gray-500">
            Vous êtes sur le point d'envoyer par email un lien sécurisé vers la liste des volontaires par lieu de rassemblement et ligne de bus mise à jour en temps réel au(x)
            destinataire(s) suivant(s) :
          </div>
          <div className="mx-4">
            {emails.length ? (
              <div className="mt-4 flex flex-col items-center justify-center">
                <div className="w-full rounded-lg border-[1px] border-gray-300  p-2">
                  <div className="pb-2 text-xs font-normal leading-4 text-gray-500">Destinataire(s)</div>
                  {emails.map((email, index) => (
                    <div key={index} className="flex flex-row items-center">
                      <IoMdClose onClick={() => setEmails((prev) => prev.filter((e) => e !== email))} className="cursor-pointer font-bold text-gray-400 hover:scale-125" />
                      <div className="pl-2 text-sm font-normal leading-5 text-gray-800">{email}</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="mt-4 flex w-full flex-row items-center justify-between overflow-hidden rounded-lg border-[1px] border-gray-300">
              <form className="w-full" onSubmit={(e) => handleEmail(e)}>
                <div className="flex flex-col px-2 py-3">
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="+ Ajouter un destinataire"
                    className="w-full text-xs font-normal leading-4  text-gray-800"
                  />
                  {error ? <div className="text-xs font-normal text-red-500">Veuillez entrer une adresse email valide</div> : null}
                </div>
              </form>
              {value ? <FaPlus className="mr-4 cursor-pointer font-bold text-snu-purple-300 hover:scale-125" onClick={() => handleEmail()} /> : null}
            </div>
          </div>
        </div>
        <div className="flex gap-2 p-4">
          <button
            className="flex flex-1 cursor-pointer items-center justify-center rounded-lg border-[1px] border-gray-300 py-2 text-gray-700 disabled:cursor-wait disabled:opacity-50"
            disabled={isLoading}
            onClick={onClickCancel}>
            Annuler
          </button>
          <button
            className="flex flex-1 cursor-pointer items-center justify-center rounded-lg bg-snu-purple-300 py-2 text-white disabled:opacity-50"
            disabled={isLoading || !emails.length}
            onClick={handleSubmit}>
            Confirmer
          </button>
        </div>
      </div>
    </ModalForm>
  );
}
