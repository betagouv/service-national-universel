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
      setMessage("");
      setIsLoading(false);
    } catch (e) {
      setIsLoading(false);
      capture(e);
      toastr.error("Oups, une erreur est survenue lors de la création de votre demande de modification");
    }
  };

  return (
    <PanelV2 title="Demandes de modifications" open={open} onClose={onClose}>
      <div className="mt-12 flex flex-col gap-4">
        <div className="text-normal font-normal leading-4 text-[#242526]">Ma demande</div>
        <textarea
          disabled={isLoading}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Détaillez votre demande avec précision..."
          rows={8}
          className="block w-full max-w-lg rounded-md border-[1px] border-gray-300 p-4 shadow-sm"
        />
        <div className="flex justify-end">
          <button
            disabled={isLoading}
            className="rounded-lg border-[1px] border-blue-600 bg-blue-600 px-4 py-2 text-white shadow-sm transition duration-300 ease-in-out hover:bg-white hover:!text-blue-600 disabled:cursor-not-allowed disabled:bg-blue-600 disabled:opacity-50  disabled:hover:!text-white"
            onClick={onSubmit}>
            Envoyer ma demande
          </button>
        </div>
      </div>
    </PanelV2>
  );
}
