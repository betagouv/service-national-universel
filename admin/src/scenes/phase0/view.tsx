import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { isBefore } from "date-fns";
import { useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";
import cx from "classnames";

import { translate, YOUNG_STATUS, ROLES, SENDINBLUE_TEMPLATES, YOUNG_SOURCE, isCle, CohortDto, YoungDto, getDepartmentForEligibility } from "snu-lib";
import { Button } from "@snu/ds/admin";

import { capture } from "@/sentry";
import api from "@/services/api";
import { AuthState } from "@/redux/auth/reducer";
import { CohortState } from "@/redux/cohorts/reducer";

import ChevronDown from "@/assets/icons/ChevronDown";
import dayjs from "@/utils/dayjs.utils";
import Bin from "@/assets/Bin";
import CheckCircle from "@/assets/icons/CheckCircle";
import XCircle from "@/assets/icons/XCircle";

import Modal from "@/components/ui/modals/Modal";

import YoungHeader from "./components/YoungHeader";
import { BorderButton, PlainButton } from "./components/Buttons";
import { ConfirmModalContent, ConfirmModalContentData } from "./components/ConfirmModalContent";
import SectionConsentements from "./components/sections/consentements/SectionConsentements";
import SectionParents from "./components/sections/SectionParents";
import SectionIdentite from "./components/sections/identite/SectionIdentite";
import SectionOldConsentements from "./components/sections/consentements/SectionOldConsentements";

const REJECTION_REASONS = {
  NOT_FRENCH: "Le volontaire n'est pas de nationalité française",
  TOO_YOUNG: "Le volontaire n'a pas l'âge requis",
  OTHER: "Autre (préciser)",
};

interface VolontairePhase0ViewProps {
  young: YoungDto;
  globalMode: "correction" | "readonly";
  onChange: () => void;
}

export default function VolontairePhase0View({ young, globalMode, onChange }: VolontairePhase0ViewProps) {
  const user = useSelector((state: AuthState) => state.Auth.user);
  const cohorts = useSelector((state: CohortState) => state.Cohorts);

  const [currentCorrectionRequestField, setCurrentCorrectionRequestField] = useState("");
  const [requests, setRequests] = useState<NonNullable<YoungDto["correctionRequests"]>>([]);
  const [processing, setProcessing] = useState(false);
  const [cohort, setCohort] = useState<CohortDto>();
  const [oldCohort, setOldCohort] = useState(true);
  const [footerMode, setFooterMode] = useState<"PENDING" | "WAITING" | "NO_REQUEST">("NO_REQUEST");
  const [footerClass, setFooterClass] = useState("");

  useEffect(() => {
    const handleStorageChange = (event) => {
      const open = event.detail.open;
      if (open === true) {
        setFooterClass("left-[220px]");
      } else {
        setFooterClass("left-[88px]");
      }
    };
    window.addEventListener("sideBar", handleStorageChange);
    return () => {
      window.removeEventListener("sideBar", handleStorageChange);
    };
  }, []);

  useEffect(() => {
    if (localStorage?.getItem("sideBarOpen") === "false") setFooterClass("left-[88px]");
    else setFooterClass("left-[220px]");
  }, []);

  useEffect(() => {
    if (young) {
      setRequests(young.correctionRequests ? young.correctionRequests.filter((r) => r.status !== "CANCELED") : []);
      const currentCohort = cohorts.find((c) => c.name === young.cohort);
      setCohort(currentCohort);
      setOldCohort(!currentCohort);
    } else {
      setRequests([]);
      setCohort(undefined);
      setOldCohort(true);
    }
  }, [young]);

  useEffect(() => {
    if (requests.some((r) => r.status === "PENDING")) {
      setFooterMode("PENDING");
    } else if (requests.some((r) => ["SENT", "REMINDED"].includes(r.status || ""))) {
      setFooterMode("WAITING");
    } else {
      setFooterMode("NO_REQUEST");
    }
  }, [requests, requests.length]);

  function onStartRequest(fieldName) {
    setCurrentCorrectionRequestField(fieldName);
  }

  async function onCorrectionRequestChange(fieldName: string, message?: string, reason?: string) {
    if (message === null && reason == null) {
      const requestIndex = requests.findIndex((req) => req.field === fieldName);
      if (requestIndex >= 0) {
        const request = requests[requestIndex];
        if (request.status === "PENDING") {
          requests.splice(requestIndex, 1);
          setRequests(requests);
        } else {
          // enregistrer l'annulation de la demande.
          setProcessing(true);
          try {
            await api.remove(`/correction-request/${young._id}/${request.field}`);
            toastr.success("La demande a bien été annulée.", "");
            onChange && onChange();
            // requests.splice(requestIndex, 1);
            // setRequests(requests);
          } catch (err) {
            console.error(err);
            toastr.error("Erreur !", "Nous n'avons pas pu enregistrer l'annulation de la demande. Veuillez réessayer dans quelques instants.");
          }
          setProcessing(false);
        }
      }
      setCurrentCorrectionRequestField("");
    } else {
      // change request
      const reqIdx = requests.findIndex((req) => {
        return req.field === fieldName;
      });
      if (reqIdx >= 0) {
        const reqsBefore = reqIdx > 0 ? requests.slice(0, reqIdx) : [];
        const reqsAfter = reqIdx < requests.length - 1 ? requests.slice(reqIdx + 1) : [];
        setRequests([...reqsBefore, { ...requests[reqIdx], message, reason, status: "PENDING" }, ...reqsAfter]);
      } else {
        setRequests([
          ...requests,
          {
            cohort: young.cohort,
            field: fieldName,
            reason,
            message,
            status: "PENDING",
          },
        ]);
      }
    }
  }

  function deletePendingRequests() {
    setRequests(
      requests.filter((req) => {
        return req.status !== "PENDING";
      }),
    );
    setCurrentCorrectionRequestField("");
  }

  async function sendPendingRequests() {
    setProcessing(true);
    const pendingRequests = requests.filter((req) => {
      return req.status === "PENDING";
    });
    if (pendingRequests.length > 0) {
      try {
        await api.post(`/correction-request/${young._id}`, pendingRequests);
        toastr.success("Demandes de corrections envoyées.", "");
        onChange && onChange();
      } catch (err) {
        console.error(err);
        toastr.error("Erreur !", translate(err.code));
      }
    }
    setProcessing(false);
  }

  async function remindRequests() {
    setProcessing(true);
    try {
      await api.post(`/correction-request/${young._id}/remind`, {});
      toastr.success("Le volontaire a été relancé.", "");
      onChange && onChange();
    } catch (err) {
      console.error(err);
      toastr.error("Erreur !", translate(err.code));
    }
    setProcessing(false);
  }

  async function processRegistration(state, data) {
    setProcessing(true);
    try {
      const body = {
        lastStatusAt: Date.now(),
        phase: "INSCRIPTION",
        status: state,
        inscriptionRefusedMessage: "",
      };

      if (state === "REFUSED") {
        if (data.reason === "OTHER") {
          body.inscriptionRefusedMessage = data.message;
        } else {
          body.inscriptionRefusedMessage = REJECTION_REASONS[data.reason];
        }
      }

      const { ok, code } = await api.put(`/referent/young/${young._id}`, body);
      if (!ok) {
        toastr.error("Oups, une erreur est survenue", translate(code));
        return;
      }

      //Notify young
      // TODO: move notification logic to referent controller
      const validationTemplate = isCle(young) ? SENDINBLUE_TEMPLATES.young.INSCRIPTION_VALIDATED_CLE : SENDINBLUE_TEMPLATES.young.INSCRIPTION_VALIDATED;
      switch (state) {
        case "REFUSED":
          await api.post(`/young/${young._id}/email/${SENDINBLUE_TEMPLATES.young.INSCRIPTION_REFUSED}`, { message: body.inscriptionRefusedMessage });
          break;
        case "WAITING_LIST":
          await api.put(`/referent/young/${young._id}`, { status: YOUNG_STATUS.WAITING_LIST });
          await api.post(`/young/${young._id}/email/${SENDINBLUE_TEMPLATES.young.INSCRIPTION_WAITING_LIST}`);
          break;
        case "VALIDATED":
          await api.post(`/young/${young._id}/email/${validationTemplate}`);
          break;
      }

      toastr.success("Votre action a été enregistrée.", "");
      onChange && onChange();
    } catch (err) {
      console.error(err);
      toastr.error("Erreur !", translate(err.code));
    } finally {
      setProcessing(false);
    }
  }

  return (
    <>
      <YoungHeader young={young} tab="file" onChange={onChange} />
      <div className="p-[30px]">
        {(young.status === YOUNG_STATUS.WAITING_CORRECTION || young.status === YOUNG_STATUS.WAITING_VALIDATION) && (
          <div className="pb-[30px]">
            <h1 className="mb-[8px] text-center text-[30px] font-bold">Veuillez vérifier le dossier</h1>
            <p className="mx-auto max-w-[826px] text-center text-[14px] leading-[20px]">
              Vous pouvez faire une <b>demande de correction</b> si besoin en passant votre curseur sur un champ et en cliquant sur le bouton orange. Si vous le souhaitez, vous
              pouvez également <b>modifier</b> vous-même l’information en cliquant sur &quot;modifier&quot;.
            </p>
          </div>
        )}
        <SectionIdentite
          cohort={cohort}
          young={young}
          globalMode={globalMode}
          requests={requests}
          onStartRequest={onStartRequest}
          currentRequest={currentCorrectionRequestField}
          onCorrectionRequestChange={onCorrectionRequestChange}
          onChange={onChange}
          readonly={user.role === ROLES.HEAD_CENTER}
        />
        <SectionParents
          young={young}
          globalMode={globalMode}
          requests={requests}
          onStartRequest={onStartRequest}
          currentRequest={currentCorrectionRequestField}
          onCorrectionRequestChange={onCorrectionRequestChange}
          onChange={onChange}
          oldCohort={oldCohort}
          readonly={user.role === ROLES.HEAD_CENTER}
        />
        {oldCohort ? (
          <SectionOldConsentements young={young} />
        ) : (
          <SectionConsentements young={young} onChange={onChange} readonly={user.role === ROLES.HEAD_CENTER} cohort={cohort} />
        )}
      </div>
      {globalMode === "correction" && (
        <>
          {footerMode === "PENDING" && (
            <FooterPending
              young={young}
              requests={requests}
              onDeletePending={deletePendingRequests}
              sending={processing}
              onSendPending={sendPendingRequests}
              footerClass={footerClass}
            />
          )}
          {footerMode === "WAITING" && <FooterSent young={young} requests={requests} reminding={processing} onRemindRequests={remindRequests} footerClass={footerClass} />}
          {footerMode === "NO_REQUEST" && <FooterNoRequest young={young} processing={processing} onProcess={processRegistration} footerClass={footerClass} />}
        </>
      )}
    </>
  );
}

function FooterPending({
  young,
  requests,
  sending,
  onDeletePending,
  onSendPending,
  footerClass,
}: {
  young: YoungDto;
  requests: NonNullable<YoungDto["correctionRequests"]>;
  sending: boolean;
  onDeletePending: () => void;
  onSendPending: () => void;
  footerClass: string;
}) {
  const sentRequestsCount = requests.filter((r) => r.status === "SENT" || r.status === "REMINDED")?.length || 0;
  const pendingRequestsCount = requests.filter((r) => r.status === "PENDING")?.length || 0;

  return (
    <div className={`fixed bottom-0 right-0 flex bg-white py-[20px] px-[42px] shadow-[0px_-16px_16px_-3px_rgba(0,0,0,0.05)] ${footerClass}`}>
      <div className="grow">
        <div className="flex items-center">
          <span className="text-[18px] font-medium leading-snug text-[#242526]">Le dossier est-il conforme&nbsp;?</span>
          {pendingRequestsCount > 0 && (
            <>
              {sentRequestsCount > 0 && (
                <span className="ml-[12px] rounded-[100px] border-[1px] border-[#CECECE] bg-[#F7F7F7] py-[4px] px-[10px] text-[12px] text-[#6B7280]">
                  {sentRequestsCount} {sentRequestsCount > 1 ? "corrections envoyées" : "correction envoyée"}
                </span>
              )}
              <span className="ml-[12px] rounded-[100px] bg-[#F97316] py-[4px] px-[10px] text-[12px] text-[#FFFFFF]">
                {pendingRequestsCount} {pendingRequestsCount > 1 ? "corrections demandées" : "correction demandée"}
              </span>
              <button className="ml-[12px] flex items-center text-[12px] text-[#F87171]" onClick={onDeletePending}>
                <Bin fill="#F87171" />
                <span className="ml-[5px]">Supprimer {pendingRequestsCount > 1 ? "les demandes" : "la demande"}</span>
              </button>
            </>
          )}
        </div>
        <p className="mt-[8px] text-[14px] leading-[20px] text-[#6B7280]">
          Votre demande sera transmise par mail à {young.firstName} {young.lastName} ({young.email})
        </p>
      </div>
      <div>
        <PlainButton spinner={sending} onClick={onSendPending}>
          Envoyer la demande de correction
        </PlainButton>
      </div>
    </div>
  );
}

function FooterSent({
  young,
  requests,
  reminding,
  onRemindRequests,
  footerClass,
}: {
  young: YoungDto;
  requests: NonNullable<YoungDto["correctionRequests"]>;
  reminding: boolean;
  onRemindRequests: (type?: ConfirmModalContentData["type"], message?: { reason: string; message: string } | null) => void;
  footerClass: string;
}) {
  const [sentRequestsCount, setSentRequestsCount] = useState(0);

  useEffect(() => {
    setSentRequestsCount(requests.filter((r) => r.status === "SENT" || r.status === "REMINDED").length);
  }, [requests]);

  let sentDate: Date | null = null;
  let remindedDate: Date | null = null;
  for (const req of requests) {
    if (req.status === "SENT") {
      if (sentDate === null || (req.sentAt && req.sentAt.valueOf() > sentDate.valueOf())) {
        sentDate = req.sentAt || null;
      }
    } else if (req.status === "REMINDED") {
      if (remindedDate === null || (req.remindedAt && req.remindedAt.valueOf() > remindedDate.valueOf())) {
        remindedDate = req.remindedAt || null;
      }
    }
  }
  const sentAt = sentDate ? dayjs(sentDate).format("DD/MM/YYYY à HH:mm") : null;
  const remindedAt = remindedDate ? dayjs(remindedDate).format("DD/MM/YYYY à HH:mm") : null;

  return (
    <div className={`fixed bottom-0 right-0 flex bg-white py-[20px] px-[42px] shadow-[0px_-16px_16px_-3px_rgba(0,0,0,0.05)] ${footerClass}`}>
      <div className="grow">
        <div className="flex items-center">
          <span className="text-[18px] font-medium leading-snug text-[#242526]">Demande de correction envoyée</span>
          <span className="ml-[12px] rounded-[100px] border-[1px] border-[#CECECE] bg-[#F7F7F7] py-[4px] px-[10px] text-[12px] text-[#6B7280]">
            {sentRequestsCount} {sentRequestsCount > 1 ? "corrections demandées" : "correction demandée"}
          </span>
        </div>
        <p className="mt-[8px] text-[14px] leading-[20px] text-[#6B7280]">
          {sentAt && "Envoyée le " + sentAt} {remindedAt && (sentAt ? "/ " : "") + "Relancé(e) le " + remindedAt}
        </p>
      </div>
      <div>
        <BorderButton onClick={onRemindRequests}>Relancer {young.gender === "female" ? "la" : "le"} volontaire</BorderButton>
      </div>
    </div>
  );
}

function FooterNoRequest({
  processing,
  onProcess,
  young,
  footerClass,
}: {
  processing: boolean;
  onProcess: (type?: ConfirmModalContentData["type"], message?: { reason: string; message: string } | null) => void;
  young: YoungDto;
  footerClass: string;
}) {
  const history = useHistory();
  const [confirmModal, setConfirmModal] = useState<ConfirmModalContentData | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectionMessage, setRejectionMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const isDatePassed = young.latestCNIFileExpirationDate ? isBefore(new Date(young.latestCNIFileExpirationDate), new Date()) : false;

  async function validate() {
    try {
      if (young.source === YOUNG_SOURCE.CLE) {
        return setConfirmModal(ConfirmModalContent({ source: young.source, isDatePassed, young }));
      } else {
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
        return setConfirmModal(ConfirmModalContent({ source: young.source, isGoalReached, isLCavailable, isDatePassed, young }));
      }
    } catch (e) {
      capture(e);
      toastr.error("Erreur lors de la récupération des objectifs: " + e.message, "");
    }
  }

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

  const youngCleREfusedMessage =
    "Votre inscription au SNU dans le cadre du dispositif Classe et Lycée Engagés a été refusée. Pour plus d'informations, merci de vous rapprocher de votre établissement.";

  function reject() {
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

  function confirm() {
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
        <PlainButton spinner={processing} onClick={validate} mode="green" className="ml-[8px]">
          <CheckCircle className="text-[#10B981]" />
          Valider
        </PlainButton>
        <PlainButton spinner={processing} onClick={reject} mode="red" className="ml-[8px]">
          <XCircle className="text-[#EF4444]" />
          Refuser
        </PlainButton>
      </div>
      <Modal isOpen={confirmModal ? true : false}>
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
                      history.push(confirmModal.cancelUrl);
                    }
                    setConfirmModal(null);
                  }}
                />
                <Button type={confirmModal.mainAction !== "cancel" ? "primary" : "secondary"} title={confirmModal.confirmLabel || "Confirmer"} onClick={confirm} className="grow" />
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
