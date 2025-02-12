import ChevronDown from "@/assets/icons/ChevronDown";
import Download from "@/assets/icons/Download";
import { capture } from "@/sentry";
import API from "@/services/api";
import useAuth from "@/services/useAuth";
import downloadPDF from "@/utils/download-pdf";
import React from "react";
import { FiMail } from "react-icons/fi";
import { toastr } from "react-redux-toastr";
import { translate } from "snu-lib";

export default function AttestationButton() {
  const { young } = useAuth();
  const [openAttestationButton, setOpenAttestationButton] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const refAttestationButton = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (refAttestationButton.current && !refAttestationButton.current.contains(event.target)) {
        setOpenAttestationButton(false);
      }
    };
    document.addEventListener("click", handleClickOutside, true);
    return () => {
      document.removeEventListener("click", handleClickOutside, true);
    };
  }, []);

  const viewAttestation = async ({ uri }) => {
    setLoading(true);
    await downloadPDF({
      url: `/young/${young._id}/documents/certificate/${uri}`,
      fileName: `${young.firstName} ${young.lastName} - attestation ${uri}.pdf`,
    });
    setLoading(false);
  };

  const sendAttestation = async ({ template, type }) => {
    try {
      setLoading(true);
      const { ok, code } = await API.post(`/young/${young._id}/documents/${template}/${type}/send-email`, {
        fileName: `${young.firstName} ${young.lastName} - ${template} ${type}.pdf`,
      });
      setLoading(false);
      if (!ok) throw new Error(translate(code));
      toastr.success("Succès", `Document envoyé à ${young.email}`);
    } catch (e) {
      capture(e);
      setLoading(false);
      return toastr.error("Erreur lors de l'envoi du document : ", e.message);
    }
  };

  return (
    <div className="relative" ref={refAttestationButton}>
      <button
        disabled={loading}
        className="flex w-full items-center justify-between gap-3 rounded-full border-[1px] border-blue-600 bg-blue-600 px-3 py-2 hover:border-blue-500 hover:bg-blue-500 disabled:cursor-wait disabled:opacity-50"
        onClick={() => setOpenAttestationButton((e) => !e)}>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium leading-4 text-white">Attestation de réalisation phase 1</span>
        </div>
        <ChevronDown className="font-medium text-white" />
      </button>
      <div
        className={`${
          openAttestationButton ? "block" : "hidden"
        }  absolute right-0 top-[40px] z-50 !min-w-full overflow-hidden rounded-lg bg-white shadow transition lg:!min-w-3/4`}>
        <button
          key="download"
          onClick={() => {
            viewAttestation({ uri: "1" });
            setOpenAttestationButton(false);
          }}
          className="w-full">
          <div className="group flex cursor-pointer items-center gap-3 p-2 px-3 text-sm leading-5 hover:bg-gray-50">
            <Download className="h-4 w-4 text-gray-400" />
            <div>Télécharger</div>
          </div>
        </button>
        <button
          key="email"
          onClick={() => {
            sendAttestation({ type: "1", template: "certificate" });
            setOpenAttestationButton(false);
          }}
          className="w-full">
          <div className="w-full group flex cursor-pointer items-center gap-3 p-2 px-3 text-sm leading-5 hover:bg-gray-50">
            <FiMail className="h-4 w-4 text-gray-400" />
            <div>Envoyer par mail</div>
          </div>
        </button>
      </div>
    </div>
  );
}
