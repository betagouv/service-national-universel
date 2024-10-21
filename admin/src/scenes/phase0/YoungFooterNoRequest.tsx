import React, { useState } from "react";
import { isBefore } from "date-fns";
import { toastr } from "react-redux-toastr";
import { HiInformationCircle } from "react-icons/hi";

import { YOUNG_STATUS, YOUNG_SOURCE, YoungDto, getDepartmentForEligibility, translate, InscrriptionGoalsRoutes } from "snu-lib";

import { capture } from "@/sentry";
import api from "@/services/api";
import { buildRequest } from "@/utils/buildRequest";

import CheckCircle from "@/assets/icons/CheckCircle";
import XCircle from "@/assets/icons/XCircle";
import ShieldCheck from "@/assets/icons/ShieldCheck";

import { REJECTION_REASONS_KEY } from "./commons";
import { PlainButton } from "./components/Buttons";
import YoungConfirmationModal, { ConfirmModalContentData } from "./YoungConfirmationModal";

const YOUNG_CLE_REFUSED_MESSAGE =
  "Votre inscription au SNU dans le cadre du dispositif Classe et Lycée Engagés a été refusée. Pour plus d'informations, merci de vous rapprocher de votre établissement.";

interface YoungFooterNoRequestProps {
  processing: boolean;
  young: YoungDto;
  onProcess: (
    type?: ConfirmModalContentData["type"],
    message?: { reason: ConfirmModalContentData["rejectReason"]; message: ConfirmModalContentData["rejectMessage"] } | null,
  ) => void;
  footerClass: string;
}

export function YoungFooterNoRequest({ processing, young, onProcess, footerClass }: YoungFooterNoRequestProps) {
  const [confirmModal, setConfirmModal] = useState<ConfirmModalContentData | null>(null);

  async function handleValidateYoung() {
    try {
      const isDatePassed = young.latestCNIFileExpirationDate ? isBefore(new Date(young.latestCNIFileExpirationDate), new Date()) : false;
      let isGoalReached, isLCavailable;
      if (young.source !== YOUNG_SOURCE.CLE) {
        // on vérifie la completion des objectifs pour la région (en fonction du département)
        // schoolDepartment pour les scolarisés et HZR sinon department pour les non scolarisés
        const departement = getDepartmentForEligibility(young);
        const {
          ok,
          code,
          data: fillingRate,
        } = await buildRequest<InscrriptionGoalsRoutes["getTauxRemplissage"]>({
          method: "GET",
          path: "/inscription-goal/{cohort}/department/{departement}",
          params: {
            cohort: young.cohort!,
            departement,
          },
        })();
        if (!ok) throw new Error(code);
        isGoalReached = fillingRate! >= 1;
        // on vérifie qu'il n'y pas de jeunes en LC
        const { responses } = await api.post("/elasticsearch/young/search", {
          filters: { cohort: [young.cohort], status: [YOUNG_STATUS.WAITING_LIST] },
        });
        isLCavailable = (responses?.[0]?.hits?.total?.value || 0) > 0;
      }
      return setConfirmModal(getConfirmModalContent({ source: young.source, isGoalReached, isLCavailable, isDatePassed, young }));
    } catch (e) {
      capture(e);
      toastr.error("Erreur lors de la récupération des objectifs", translate(e.message));
    }
  }

  function handleRejectYoung() {
    setConfirmModal({
      icon: <XCircle className="h-[36px] w-[36px] text-[#D1D5DB]" />,
      title: "Refuser le dossier",
      message: `Vous vous apprêtez à refuser le dossier d’inscription de ${young.firstName} ${young.lastName}. Dites-lui pourquoi ci-dessous. Un email sera automatiquement envoyé au volontaire.`,
      type: "REFUSED",
      confirmLabel: "Confirmer le refus",
      confirmColor: "danger",
      rejectReason: young.source === YOUNG_SOURCE.CLE ? REJECTION_REASONS_KEY.OTHER : undefined,
      rejectMessage: young.source === YOUNG_SOURCE.CLE ? YOUNG_CLE_REFUSED_MESSAGE : undefined,
    });
  }

  function handleConfirm({
    rejectionReason,
    rejectionMessage,
    state,
  }: {
    rejectionReason: ConfirmModalContentData["rejectReason"];
    rejectionMessage: ConfirmModalContentData["rejectMessage"];
    state?: ConfirmModalContentData["type"];
  }) {
    if (confirmModal?.type === YOUNG_STATUS.REFUSED) {
      if (!rejectionReason) {
        setConfirmModal((prev) => ({ ...prev!, errorMessage: "Vous devez obligatoirement sélectionner un motif." }));
        return;
      } else if (rejectionReason === REJECTION_REASONS_KEY.OTHER && rejectionMessage!.trim().length === 0) {
        setConfirmModal((prev) => ({ ...prev!, errorMessage: "Pour le motif 'Autre', vous devez précisez un message." }));
        return;
      } else {
        setConfirmModal((prev) => ({ ...prev!, errorMessage: undefined }));
      }
    }
    onProcess(
      state || confirmModal?.type,
      confirmModal?.type === YOUNG_STATUS.REFUSED
        ? {
            reason: rejectionReason,
            message: rejectionMessage,
          }
        : null,
    );
    setConfirmModal(null);
  }

  return (
    <div className={`fixed bottom-0 right-0 flex bg-white py-[20px] px-[42px] shadow-[0px_-16px_16px_-3px_rgba(0,0,0,0.05)] ${footerClass}`}>
      <div className="grow">
        <div className="flex items-center">
          <span className="text-[18px] font-medium leading-snug text-[#242526]">Le dossier est-il conforme&nbsp;?</span>
        </div>
        <p className="text-[14px] leading-[20px] text-[#6B7280]">Veuillez actualiser le statut du dossier d&apos;inscription.</p>
      </div>
      <div className="flex gap-2">
        <PlainButton spinner={processing} onClick={handleValidateYoung} mode="green" className="ml-[8px]">
          <CheckCircle className="text-[#10B981]" />
          Valider
        </PlainButton>
        <PlainButton spinner={processing} onClick={handleRejectYoung} mode="red" className="ml-[8px]">
          <XCircle className="text-[#EF4444]" />
          Refuser
        </PlainButton>
      </div>
      {!!confirmModal && (
        <YoungConfirmationModal
          key={JSON.stringify(confirmModal)}
          young={young}
          content={confirmModal}
          onConfirm={handleConfirm}
          onReject={handleRejectYoung}
          onClose={() => setConfirmModal(null)}
        />
      )}
    </div>
  );
}

export function getConfirmModalContent({
  source,
  isGoalReached,
  isLCavailable,
  isDatePassed,
  young,
}: {
  source: YoungDto["source"];
  isGoalReached?: boolean;
  isDatePassed: boolean;
  isLCavailable?: boolean;
  young: YoungDto;
}) {
  const modalContent: ConfirmModalContentData = {
    icon: <ShieldCheck className="h-[36px] w-[36px] text-[#D1D5DB]" />,
    title: "",
    message: `Souhaitez-vous confirmer l'action ?`,
    type: isGoalReached ? YOUNG_STATUS.WAITING_LIST : YOUNG_STATUS.VALIDATED,
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
        L&apos;objectif d&apos;inscription de votre région a été atteint à 100%. Le dossier d&apos;inscription de {young.firstName} {young.lastName} va être{" "}
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
    modalContent.confirmLabel = "Valider sur la liste complémentaire";
    modalContent.confirmSatus = YOUNG_STATUS.WAITING_LIST;
    modalContent.withoutCancelAction = true;
    modalContent.customActions = [
      {
        label: "Valider sur liste principale",
        type: "VALIDATE",
        status: YOUNG_STATUS.VALIDATED,
      },
      {
        label: "Voir la liste complémentaire",
        type: "URL",
        url: `/volontaire?cohort=${young.cohort}&status=${YOUNG_STATUS.WAITING_LIST}&page=1`,
      },
    ];
  } else {
    title = (
      <span>
        L&apos;objectif d&apos;inscription de votre région n&apos;a pas été atteint à 100%. Le dossier d&apos;inscription de {young.firstName} {young.lastName} va être{" "}
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
