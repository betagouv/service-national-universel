import React from "react";
import { toastr } from "react-redux-toastr";

import plausibleEvent from "@/services/plausible";
import { ClasseFileKeys } from "snu-lib";
import { CDN_BASE_URL } from "@/utils";

export default function ButtonDownloadEmptyFile({ title, type, setIsLoading }) {
  const getFile = async (type) => {
    plausibleEvent(`Téléchargement Formulaire classe - Formulaire ${type}`);
    try {
      setIsLoading(true);

      let url;
      if (type === ClasseFileKeys.INSCRIPTION) {
        url = `${CDN_BASE_URL}/CLE/Formulaire_Inscription_SNU.pdf`;
      }

      if (type === ClasseFileKeys.CONSENT) {
        url = `${CDN_BASE_URL}/CLE/Formulaire_Consentement_Participation_SNU.pdf`;
      }
      if (type === ClasseFileKeys.IMAGE) {
        url = `${CDN_BASE_URL}/CLE/Formulaire_Autorisation_Droits_Image.pdf`;
      }
      if (type === ClasseFileKeys.REGLEMENT) {
        url = `${CDN_BASE_URL}/CLE/snu-reglement-interieur.pdf`;
      }
      if (type === ClasseFileKeys.CONSENT_DATA) {
        url = `${CDN_BASE_URL}/CLE/Formulaire_Consentement_Protection_données.pdf`;
      }
      window.open(url, "_blank", "noreferrer");
    } catch (e) {
      toastr.error("Oups, une erreur est survenue pendant le téléchagement", "");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <button type="button" className="flex items-center justify-start w-full text-sm leading-5 font-normal" onClick={() => getFile(type)}>
      {title}
    </button>
  );
}
