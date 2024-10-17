import React, { ReactNode, useState } from "react";
import { useHistory } from "react-router-dom";
import { isBefore } from "date-fns";
import { toastr } from "react-redux-toastr";
import cx from "classnames";
import { HiInformationCircle } from "react-icons/hi";

import { YOUNG_STATUS, YOUNG_SOURCE, YoungDto, getDepartmentForEligibility } from "snu-lib";
import { Button } from "@snu/ds/admin";

import { capture } from "@/sentry";
import api from "@/services/api";

import ChevronDown from "@/assets/icons/ChevronDown";
import CheckCircle from "@/assets/icons/CheckCircle";
import XCircle from "@/assets/icons/XCircle";

import Modal from "@/components/ui/modals/Modal";

import { REJECTION_REASONS } from "./commons";
import { PlainButton } from "./components/Buttons";
import ShieldCheck from "@/assets/icons/ShieldCheck";

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
  secondaryLabel?: string;
  confirmColor?: string;
  cancelLabel?: string;
  cancelUrl?: string;
  mainAction?: "cancel" | "confirm";
}

const youngCleREfusedMessage =
  "Votre inscription au SNU dans le cadre du dispositif Classe et Lycée Engagés a été refusée. Pour plus d'informations, merci de vous rapprocher de votre établissement.";

const rejectionReasonOptions = [
  <option value="" key="none">
    Motif
  </option>,
  <option value="NOT_FRENCH" key="NOT_FRENCH">
    {REJECTION_REASONS.NOT_FRENCH}
  </option>,
  <option value="TOO_YOUNG" key="TOO_YOUNG">
    {REJECTION_REASONS.TOO_YOUNG}
  </option>,
  <option value="OTHER" key="OTHER">
    {REJECTION_REASONS.OTHER}
  </option>,
];

interface YoungFooterNoRequestProps {
  processing: boolean;
  onProcess: (type?: ConfirmModalContentData["type"], message?: { reason: string; message: string } | null) => void;
  young: YoungDto;
  footerClass: string;
}

export function YoungFooterNoRequest({ processing, onProcess, young, footerClass }: YoungFooterNoRequestProps) {
  const history = useHistory();

  const [confirmModal, setConfirmModal] = useState<ConfirmModalContentData | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectionMessage, setRejectionMessage] = useState("");
  const [error, setError] = useState<string | null>(null);

  const isDatePassed = young.latestCNIFileExpirationDate ? isBefore(new Date(young.latestCNIFileExpirationDate), new Date()) : false;

  async function handleValidateYoung() {
    try {
      if (young.source === YOUNG_SOURCE.CLE) {
        return setConfirmModal(getConfirmModalContent({ source: young.source, isDatePassed, young }));
      }
      // on vérifie la completion des objectifs pour le département
      // schoolDepartment pour les scolarisés et HZR sinon department pour les non scolarisés
      const departement = getDepartmentForEligibility(young);
      const { ok, code, data: fillingRate } = await api.get(`/inscription-goal/${young.cohort}/department/${departement}`);
      if (!ok) throw new Error(code);
      const isGoalReached = fillingRate >= 1;
      // on vérifie qu'il n'y pas de jeunes en LC
      const { responses } = await api.post("/elasticsearch/young/search", {
        filters: { cohort: [young.cohort], status: [YOUNG_STATUS.WAITING_LIST] },
      });
      const isLCavailable = (responses?.[0]?.hits?.total?.value || 0) > 0;
      return setConfirmModal(getConfirmModalContent({ source: young.source, isGoalReached, isLCavailable, isDatePassed, young }));
    } catch (e) {
      capture(e);
      toastr.error("Erreur lors de la récupération des objectifs: " + e.message, "");
    }
  }

  function handleRejectYoung() {
    setRejectionReason(young.source === YOUNG_SOURCE.CLE ? "OTHER" : "");
    setRejectionMessage(young.source === YOUNG_SOURCE.CLE ? youngCleREfusedMessage : "");

    setConfirmModal({
      icon: <XCircle className="h-[36px] w-[36px] text-[#D1D5DB]" />,
      title: "Refuser le dossier",
      message: `Vous vous apprêtez à refuser le dossier d’inscription de ${young.firstName} ${young.lastName}. Dites-lui pourquoi ci-dessous. Un email sera automatiquement envoyé au volontaire.`,
      type: "REFUSED",
      confirmLabel: "Confirmer le refus",
      confirmColor: "danger",
    });
  }

  function handleConfirm() {
    if (confirmModal?.type === "REFUSED") {
      if (rejectionReason === "") {
        setError("Vous devez obligatoirement sélectionner un motif.");
        return;
      } else if (rejectionReason === "OTHER" && rejectionMessage.trim().length === 0) {
        setError("Pour le motif 'Autre', vous devez précisez un message.");
        return;
      } else {
        setError(null);
      }
    }
    onProcess(
      confirmModal?.type,
      confirmModal?.type === "REFUSED"
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
      <Modal isOpen={!!confirmModal}>
        {confirmModal && (
          <>
            <Modal.Header className="flex-col">
              {confirmModal.icon && <div className="mb-auto flex justify-center">{confirmModal.icon}</div>}
              <h2 className="m-0 text-center text-xl leading-7">{confirmModal.title}</h2>
            </Modal.Header>
            <Modal.Content>
              {(confirmModal.type === "VALIDATED" || confirmModal.type === "SESSION_FULL") && <p className="mb-0 text-center text-xl leading-7">{confirmModal.message}</p>}
              {confirmModal.type === "REFUSED" && (
                <div className="mt-[24px]">
                  <div className="mb-[16px] flex w-[100%] items-center rounded-[6px] border-[1px] border-[#D1D5DB] bg-white pr-[15px]">
                    <select
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      className="block grow appearance-none bg-[transparent] p-[15px]"
                      disabled={young.source === YOUNG_SOURCE.CLE}>
                      {rejectionReasonOptions}
                    </select>
                    <ChevronDown className="flex-[0_0_16px] text-[#6B7280]" />
                  </div>
                  {rejectionReason === "OTHER" && (
                    <textarea
                      value={rejectionMessage}
                      onChange={(e) => setRejectionMessage(e.target.value)}
                      className="w-[100%] rounded-[6px] border-[1px] border-[#D1D5DB] bg-white p-[15px]"
                      rows={5}
                      placeholder="Précisez la raison de votre refus ici"
                    />
                  )}
                  {error && <div className="text-[#EF4444]">{error}</div>}
                </div>
              )}
            </Modal.Content>
            <Modal.Footer>
              <div className={cx("flex items-center justify-between gap-2", { "flex-row-reverse": confirmModal.mainAction === "cancel" })}>
                <Button
                  className="grow"
                  type={confirmModal.mainAction === "cancel" ? "primary" : "secondary"}
                  title={confirmModal.cancelLabel || "Annuler"}
                  onClick={() => {
                    if (confirmModal.cancelUrl) {
                      // TODO: new tab
                      history.push(confirmModal.cancelUrl);
                    }
                    setConfirmModal(null);
                  }}
                />
                <Button
                  type={confirmModal.mainAction !== "cancel" ? "primary" : "secondary"}
                  title={confirmModal.confirmLabel || "Confirmer"}
                  onClick={handleConfirm}
                  className="grow"
                />
              </div>
              {confirmModal.infoLink && (
                <div className="flex items-center justify-center pt-6">
                  <a
                    href={confirmModal.infoLink.href}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-transparent px-3 py-2 text-blue-600 drop-shadow-sm hover:cursor-pointer hover:text-blue-700 hover:underline disabled:opacity-60 disabled:hover:text-blue-600 disabled:hover:no-underline">
                    {confirmModal.infoLink.text}
                  </a>
                </div>
              )}
            </Modal.Footer>
          </>
        )}
      </Modal>
    </div>
  );
}

function getConfirmModalContent({
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
    modalContent.confirmLabel = "Valider sur la liste complementaire";
    modalContent.secondaryLabel = "Valider sur liste principale";
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
