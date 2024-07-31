import React from "react";
import ModalForm from "../../../../components/modals/ModalForm";
import SpeakerPhone from "../../../../assets/icons/SpeakerPhone";
import api from "../../../../services/api";
import { toastr } from "react-redux-toastr";
import { translate } from "snu-lib";

export default function ModalPointagePresenceJDM({ isOpen, onSubmit, onCancel, value, young }) {
  const [isLoading, setIsLoading] = React.useState(false);

  const getTitle = () => {
    if (value === "true") return `Marquer ${young.firstName} présent(e) à la JDM`;
    if (value === "false") return `Marquer ${young.firstName} absent(e) à la JDM`;
    return `Marquer la présence de ${young.firstName} en non renseigné`;
  };
  const getMessage = () => {
    if (value === "true") return `Vous êtes sur le point de marquer ${young.firstName} présent(e) à la JDM.`;
    if (value === "false") return `Vous êtes sur le point de marquer ${young.firstName} absent(e) à la JDM.`;
    return `Vous êtes sur le point de marquer la présence à la JDM de ${young.firstName} en non renseigné.`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { data, ok, code } = await api.post(`/young/${young._id}/phase1/presenceJDM`, { value });
      if (!ok) {
        toastr.error("Oups, une erreur s'est produite", translate(code));
        setIsLoading(false);
        return;
      }
      await onSubmit(data);
    } catch (error) {
      toastr.error("Oups, une erreur s'est produite", translate(error.code));
    }
    setIsLoading(false);
  };

  const onClickCancel = (e) => {
    e.preventDefault();
    onCancel();
  };

  return (
    <ModalForm isOpen={isOpen} onCancel={onCancel} showCloseIcon={false}>
      <form className="w-full" onSubmit={handleSubmit}>
        <div className="flex items-center justify-center text-gray-300">
          <SpeakerPhone width={36} height={36} />
        </div>
        <div className="m-4">
          <div className="flex items-center justify-center text-center text-xl font-medium text-gray-900">{getTitle()}</div>
          <div className="flex items-center justify-center text-center text-base font-normal text-gray-500">{getMessage()}</div>
        </div>
        <div className="flex gap-2 p-4">
          <button
            className="flex flex-1 cursor-pointer items-center justify-center rounded-lg border-[1px] border-gray-300 py-2 text-gray-700 disabled:cursor-wait disabled:opacity-50"
            disabled={isLoading}
            onClick={onClickCancel}>
            Annuler
          </button>
          <button
            className="flex flex-1 cursor-pointer items-center justify-center rounded-lg bg-snu-purple-300 py-2 text-white disabled:cursor-wait disabled:opacity-50"
            disabled={isLoading}
            type="submit">
            Confirmer
          </button>
        </div>
      </form>
    </ModalForm>
  );
}
