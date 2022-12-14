import React from "react";
import { toastr } from "react-redux-toastr";
import { translate } from "snu-lib";
import PanelV2 from "../../../../components/PanelV2";
import { capture } from "../../../../sentry";
import api from "../../../../services/api";

export default function Creation({ open, setOpen, bus, getModification }) {
  const [message, setMessage] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  const onClose = () => {
    setOpen(false);
  };

  const onSubmit = async () => {
    try {
      setIsLoading(true);
      const { ok, code } = await api.post("/demande-de-modification", { message, lineId: bus._id.toString() });
      if (!ok) {
        toastr.error("Oups, une erreur est survenue lors de la modification des informations du centre", translate(code));
        return setIsLoading(false);
      }
      toastr.success("Votre demande de modification a bien été envoyée");
      await getModification();
      setOpen(false);
    } catch (e) {
      setIsLoading(false);
      capture(e);
      toastr.error("Oups, une erreur est survenue lors de la création de votre demande de modification");
    }
  };

  return (
    <PanelV2 title="Demandes de modifications" open={open} onClose={onClose}>
      <div className="flex flex-col mt-12 gap-4">
        <div className="text-normal leading-4 font-normal text-[#242526]">Ma demande</div>
        <textarea
          disabled={isLoading}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Détaillez votre demande avec précision..."
          rows={8}
          className="block w-full max-w-lg rounded-md border-[1px] border-gray-300 shadow-sm p-4"
        />
        <div className="flex justify-end">
          <button
            disabled={isLoading}
            className="border-[1px] border-blue-600 bg-blue-600 shadow-sm px-4 py-2 text-white hover:!text-blue-600 hover:bg-white transition duration-300 ease-in-out rounded-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-blue-600  disabled:hover:!text-white"
            onClick={onSubmit}>
            Envoyer ma demande
          </button>
        </div>
      </div>
    </PanelV2>
  );
}
