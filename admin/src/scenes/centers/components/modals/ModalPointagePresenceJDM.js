import React from "react";
import ModalForm from "../../../../components/modals/ModalForm";
import SpeakerPhone from "../../../../assets/icons/SpeakerPhone";
import api from "../../../../services/api";
import { toastr } from "react-redux-toastr";
import { translate } from "../../../../utils";

export default function ModalPointagePresenceJDM({ isOpen, onSubmit, onCancel, value, young }) {
  const [isLoading, setIsLoading] = React.useState(false);

  const getTitle = () => `Marquer ${young.firstName} ${value === "true" ? "présent(e)" : "absent(e)"} à la JDM`;
  const getMessage = () => `Vous êtes sur le point de marquer ${young.firstName} ${value === "true" ? "présent(e)" : "absent(e)"} à la JDM.`;

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
          <div className="flex items-center justify-center text-gray-900 text-xl font-medium">{getTitle()}</div>
          <div className="flex items-center justify-center text-gray-500 text-base font-normal text-center">{getMessage()}</div>
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
            disabled={isLoading}
            type="submit">
            Confirmer
          </button>
        </div>
      </form>
    </ModalForm>
  );
}
