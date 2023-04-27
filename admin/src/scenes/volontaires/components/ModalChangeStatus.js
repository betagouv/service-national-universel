import React from "react";
import { toastr } from "react-redux-toastr";
import ModalForm from "../../../components/modals/ModalForm";
import api from "../../../services/api";
import { useHistory } from "react-router-dom";

export default function ModalChangeStatus({ isOpen, onCancel, status, equivalenceId, young }) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [message, setMessage] = React.useState();
  const history = useHistory();

  const getMessage = () => {
    switch (status) {
      case "WAITING_CORRECTION":
        return `Veuillez éditer le message ci-dessous pour préciser les corrections à apporter. Une fois le message ci-dessous validé, il sera transmis par mail à ${young.firstName} (${young.email}).`;
      case "VALIDATED":
        return `Un mail sera transmis à ${young.firstName} (${young.email}).`;
      case "REFUSED":
        return `Merci de motiver votre refus au jeune en lui expliquant sur quelle base il n'est pas éligible au dispositif. Une fois le message ci-dessous validé, il sera transmis par mail à ${young.firstName} (${young.email}).`;
    }
  };

  const getTitle = () => {
    switch (status) {
      case "WAITING_CORRECTION":
        return "Vous êtes sur le point de demander la correction du document justificatif d’engagement";
      case "VALIDATED":
        return `Vous êtes sur le point de confirmer la demande de reconnaissance d’engagement externe de ${young.firstName}`;
      case "REFUSED":
        return `Vous êtes sur le point de refuser la demande de reconnaissance d’engagement externe de ${young.firstName}`;
    }
  };

  const getPlaceholder = () => {
    switch (status) {
      case "WAITING_CORRECTION":
        return "Précisez les corrections à apporter ici";
      case "REFUSED":
        return "Votre message ici...";
      case "VALIDATED":
        return "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const { ok } = await api.put(`/young/${young._id}/phase2/equivalence/${equivalenceId}`, { message, status });
    if (!ok) {
      toastr.error("Oups, une erreur s'est produite");
      setIsLoading(false);
      return;
    }
    setIsLoading(false);
    history.push(`/volontaire/${young._id}/phase2`);
  };

  const onClickCancel = (e) => {
    e.preventDefault();
    onCancel();
  };

  return (
    <ModalForm isOpen={isOpen} onCancel={onCancel} showCloseIcon={false}>
      <form className="w-full" onSubmit={handleSubmit}>
        <div className="mx-6">
          <div className="mb-3 flex items-center justify-center text-center text-xl text-gray-900">{getTitle()}</div>
          <div className="mb-3 flex items-center justify-center text-center text-sm font-normal text-gray-500">{getMessage()}</div>
        </div>
        {["WAITING_CORRECTION", "REFUSED"].includes(status) ? (
          <div className="mx-6 mt-4 flex">
            <div className={`w-full rounded-lg border-[1px]  py-1 px-2 ${isLoading && "bg-gray-200"}`}>
              <textarea
                placeholder={getPlaceholder()}
                className="w-full bg-inherit disabled:cursor-not-allowed"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={isLoading}
                rows="5"
              />
            </div>
          </div>
        ) : null}
        <div className="flex gap-2 p-4">
          <button
            className="flex flex-1 cursor-pointer items-center justify-center rounded-lg border-[1px] border-gray-300 py-2 text-gray-700 disabled:cursor-wait disabled:opacity-50"
            disabled={isLoading}
            onClick={onClickCancel}>
            Annuler
          </button>
          {message || status === "VALIDATED" ? (
            <button
              className="flex flex-1 cursor-pointer items-center justify-center rounded-lg bg-snu-purple-300 py-2 text-white disabled:cursor-wait disabled:opacity-50"
              disabled={isLoading}
              type="submit">
              Envoyer
            </button>
          ) : (
            <div className="flex flex-1 cursor-not-allowed items-center justify-center rounded-lg bg-snu-purple-300 py-2 text-white opacity-50">Envoyer</div>
          )}
        </div>
      </form>
    </ModalForm>
  );
}
