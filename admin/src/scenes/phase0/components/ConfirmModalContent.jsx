import React from "react";
import ShieldCheck from "../../../assets/icons/ShieldCheck";
import { HiInformationCircle } from "react-icons/hi";
import { YOUNG_SOURCE } from "snu-lib";

export function ConfirmModalContent({ source, fillingRate, isDatePassed, young }) {
  const getTitle = () => {
    if (source === YOUNG_SOURCE.CLE) {
      return (
        <span>
          Le dossier d&apos;inscription de {young.firstName} {young.lastName} va être <strong className="text-bold">validé sur liste principale</strong>.
        </span>
      );
    } else if (fillingRate >= 1) {
      return (
        <span>
          L&apos;objectif d&apos;inscription de votre département a été atteint à 100%. Le dossier d&apos;inscription de {young.firstName} {young.lastName} va être{" "}
          <strong className="text-bold">validé sur liste complémentaire</strong>.
        </span>
      );
    } else {
      return (
        <span>
          L&apos;objectif d&apos;inscription de votre département n&apos;a pas été atteint à 100%. Le dossier d&apos;inscription de {young.firstName} {young.lastName} va être{" "}
          <strong className="text-bold">validé sur liste principale</strong>.
        </span>
      );
    }
  };
  return {
    icon: <ShieldCheck className="h-[36px] w-[36px] text-[#D1D5DB]" />,
    title: (
      <>
        {getTitle()}
        {isDatePassed && (
          <>
            <HiInformationCircle size={24} className="text-blue-600 mx-auto mt-3" />
            <span className="text-blue-600">
              La date de péremption de la CNI est dépassée, pensez à vérifier qu’il n’y ait pas d’erreur de saisie.(non bloquant pour la validation du dossier)
            </span>
          </>
        )}
      </>
    ),
    message: `Souhaitez-vous confirmer l'action ?`,
    type: fillingRate >= 1 ? "WAITING_LIST" : "VALIDATED",
    infoLink: {
      href: "https://support.snu.gouv.fr/base-de-connaissance/procedure-de-validation-des-dossiers",
      text: "Des questions sur ce fonctionnement ?",
    },
  };
}
