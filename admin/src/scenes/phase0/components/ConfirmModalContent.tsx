import React, { ReactNode } from "react";
import ShieldCheck from "../../../assets/icons/ShieldCheck";
import { HiInformationCircle } from "react-icons/hi";
import { YOUNG_SOURCE, YOUNG_STATUS, YoungDto } from "snu-lib";

export interface ConfirmModalContentData {
  icon: ReactNode;
  title: ReactNode | string;
  message: string;
  type: "WAITING_LIST" | "VALIDATED" | "REFUSED" | "SESSION_FULL";
  infoLink?: {
    href: string;
    text: string;
  };
  confirmLabel?: string;
  confirmColor?: string;
  cancelLabel?: string;
  cancelUrl?: string;
  mainAction?: "cancel" | "confirm";
}

interface ConfirmModalContentProps {
  source: YoungDto["source"];
  isGoalReached?: boolean;
  isDatePassed: boolean;
  isLCavailable?: boolean;
  young: YoungDto;
}

export function ConfirmModalContent({ source, isGoalReached, isLCavailable, isDatePassed, young }: ConfirmModalContentProps) {
  const modalContent: ConfirmModalContentData = {
    icon: <ShieldCheck className="h-[36px] w-[36px] text-[#D1D5DB]" />,
    title: "",
    message: `Souhaitez-vous confirmer l'action ?`,
    type: isGoalReached ? "WAITING_LIST" : "VALIDATED",
    infoLink: {
      href: "https://support.snu.gouv.fr/base-de-connaissance/procedure-de-validation-des-dossiers",
      text: "Des questions sur ce fonctionnement ?",
    },
  };
  let title;
  if (source === YOUNG_SOURCE.CLE) {
    title = (
      <span>
        Le dossier d&apos;inscription de {young.firstName} {young.lastName} va être <strong className="text-bold">validé sur liste principale</strong>.
      </span>
    );
  } else if (isGoalReached) {
    title = (
      <span>
        L&apos;objectif d&apos;inscription de votre département a été atteint à 100%. Le dossier d&apos;inscription de {young.firstName} {young.lastName} va être{" "}
        <strong className="text-bold">validé sur liste complémentaire</strong>.
      </span>
    );
  } else if (isLCavailable) {
    title = (
      <span>
        Attention ! Des dossiers déjà validés sur <strong className="text-bold">liste complémentaire</strong> peuvent être basculés sur{" "}
        <strong className="text-bold">liste principale</strong> avant ce dossier.
      </span>
    );
    modalContent.infoLink!.text = "Vous avez un doute, consultez la base de connaissance ou contactez le support";
    modalContent.confirmLabel = "Valider quand même ce dossier";
    modalContent.cancelLabel = "Voir la liste complémentaire";
    modalContent.cancelUrl = `/volontaire?cohort=${young.cohort}&status=${YOUNG_STATUS.WAITING_LIST}&page=1`;
    modalContent.mainAction = "cancel";
  } else {
    title = (
      <span>
        L&apos;objectif d&apos;inscription de votre département n&apos;a pas été atteint à 100%. Le dossier d&apos;inscription de {young.firstName} {young.lastName} va être{" "}
        <strong className="text-bold">validé sur liste principale</strong>.
      </span>
    );
  }

  modalContent.title = (
    <>
      {title}
      {isDatePassed && (
        <>
          <HiInformationCircle size={24} className="text-blue-600 mx-auto mt-3" />
          <span className="text-blue-600">
            La date de péremption de la CNI est dépassée, pensez à vérifier qu’il n’y ait pas d’erreur de saisie.(non bloquant pour la validation du dossier)
          </span>
        </>
      )}
    </>
  );
  return modalContent;
}
