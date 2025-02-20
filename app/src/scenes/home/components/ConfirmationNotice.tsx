import React from "react";
import useAuth from "@/services/useAuth";
import { HiOutlineInformationCircle } from "react-icons/hi";

export default function ConfirmationNotice() {
  const { young } = useAuth();
  const shouldDisplayConfirmationNotice = ["2025 HTS 02 - Avril A", "2025 HTS 02 - Avril B", "2025 HTS 02 - Avril C", "2025 HTS 03 - Juin"].includes(young.cohort as string);

  if (shouldDisplayConfirmationNotice) {
    return (
      <>
        <br />
        <div className="bg-yellow-50 text-yellow-800 text-sm p-3 rounded-md flex gap-3">
          <div className="flex-none">
            <HiOutlineInformationCircle className="text-yellow-800 h-5 w-5" />
          </div>
          <div>
            <p className="font-bold">Confirmation de votre inscription : aucune action requise pour le moment</p>
            <p className="mt-2">Vous pourrez confirmer votre participation prochainement, après réception de votre affectation.</p>
            <p className="mt-2">
              <strong>À ce moment-là,</strong> vous disposerez de 3 jours pour valider votre participation via votre espace SNU.
            </p>
          </div>
        </div>
        <a href="https://support.snu.gouv.fr/base-de-connaissance/telecharger-ma-convocation" target="_blank" rel="noopener noreferrer">
          <p className="mt-4 text-sm text-blue-600 underline underline-offset-2">Comment confirmer ma présence ?</p>
        </a>
      </>
    );
  }

  return null;
}
