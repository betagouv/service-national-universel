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
      setEmails([...emails, value]);
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
          <div className="flex items-center justify-center text-gray-900 text-xl font-medium">Envoi par mail</div>
          <div className="flex items-center justify-center text-gray-500 text-sm font-normal text-center">
            Vous êtes sur le point d'envoyer par email un lien sécurisé vers la liste des volontaires par lieu de rassemblement et ligne de bus mise à jour en temps réel au(x)
            destinataire(s) suivant(s) :
          </div>
          <div className="mx-4">
            {emails.length ? (
              <div className="flex flex-col justify-center items-center mt-4">
                <div className="border-[1px] border-gray-300 rounded-lg w-full  p-2">
                  <div className="text-xs leading-4 font-normal text-gray-500 pb-2">Destinataire(s)</div>
                  {emails.map((email) => (
                    <div className="flex flex-row items-center">
                      <IoMdClose onClick={() => setEmails((prev) => prev.filter((e) => e !== email))} className="text-gray-400 font-bold hover:scale-125 cursor-pointer" />
                      <div className="text-sm leading-5 font-normal text-gray-800 pl-2">{email}</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="flex flex-row border-[1px] border-gray-300 rounded-lg w-full mt-4 overflow-hidden justify-between items-center">
              <form className="w-full" onSubmit={(e) => handleEmail(e)}>
                <div className="flex flex-col px-2 py-3">
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="+ Ajouter un destinataire"
                    className="text-xs leading-4 font-normal text-gray-800  w-full"
                  />
                  {error ? <div className="text-xs font-normal text-red-500">Veuillez entrer une adresse email valide</div> : null}
                </div>
              </form>
              {value ? <FaPlus className="mr-4 font-bold text-snu-purple-300 hover:scale-125 cursor-pointer" onClick={() => handleEmail()} /> : null}
            </div>
          </div>
        </div>
        <div className="flex p-4 gap-2">
          <button
            className="flex items-center justify-center flex-1 border-[1px] border-gray-300 text-gray-700 rounded-lg py-2 cursor-pointer disabled:opacity-50 disabled:cursor-wait"
            disabled={isLoading}
            onClick={onClickCancel}>
            Annuler
          </button>
          <button
            className="flex items-center justify-center flex-1 bg-snu-purple-300 text-white rounded-lg py-2 cursor-pointer disabled:opacity-50 disabled:cursor-wait"
            disabled={isLoading || !emails.length}
            onClick={handleSubmit}>
            Confirmer
          </button>
        </div>
      </div>
    </ModalForm>
  );
}
