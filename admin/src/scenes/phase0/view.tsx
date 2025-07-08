import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";

import { translate, YOUNG_STATUS, SENDINBLUE_TEMPLATES, isCle, CohortDto, YoungDto, YOUNG_ACCOUNT_STATUS, FeatureFlagName } from "snu-lib";

import api from "@/services/api";
import { AuthState } from "@/redux/auth/reducer";
import { CohortState } from "@/redux/cohorts/reducer";

import { isResponsableDeCentre } from "snu-lib";
import { REJECTION_REASONS, REJECTION_REASONS_KEY } from "./commons";
import YoungHeader from "./components/YoungHeader";
import SectionConsentements from "./components/sections/consentements/SectionConsentements";
import SectionParents from "./components/sections/SectionParents";
import SectionIdentite from "./components/sections/identite/SectionIdentite";
import SectionOldConsentements from "./components/sections/consentements/SectionOldConsentements";
import { YoungFooterPending } from "./YoungFooterPending";
import { YoungFooterSent } from "./YoungFooterSent";
import { YoungFooterNoRequest } from "./YoungFooterNoRequest";
import { ConfirmModalContentData } from "./YoungConfirmationModal";
import InfoMessage from "../dashboardV2/components/ui/InfoMessage";

interface VolontairePhase0ViewProps {
  young: YoungDto;
  onChange: (options?: any) => Promise<any>;
  globalMode: "correction" | "readonly";
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

  const isPrecompte = young.accountStatus === YOUNG_ACCOUNT_STATUS.PRECOMPTE;

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
    if (!young) throw new Error("Young is missing");

    setRequests(young.correctionRequests ? young.correctionRequests.filter((r) => r.status !== "CANCELED") : []);
    const currentCohort = cohorts.find((c) => c.name === young.cohort);
    if (!currentCohort) throw new Error("Cohort is missing");
    setCohort(currentCohort);
    setOldCohort(!currentCohort);
  }, [young, cohorts]);

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

  async function processRegistration(
    state?: ConfirmModalContentData["type"],
    data?: { reason: ConfirmModalContentData["rejectReason"]; message: ConfirmModalContentData["rejectMessage"] } | null,
  ) {
    setProcessing(true);
    try {
      const body = {
        lastStatusAt: Date.now(),
        phase: "INSCRIPTION",
        status: state,
        inscriptionRefusedMessage: "",
      };

      if (state === YOUNG_STATUS.REFUSED) {
        if (!data) {
          toastr.error("Oups, une erreur est survenue", "impossible de récupérer la raison du refus...");
          return;
        }
        if (data.reason === REJECTION_REASONS_KEY.OTHER) {
          body.inscriptionRefusedMessage = data.message!;
        } else {
          body.inscriptionRefusedMessage = REJECTION_REASONS[data.reason!];
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
        case YOUNG_STATUS.REFUSED:
          await api.post(`/young/${young._id}/email/${SENDINBLUE_TEMPLATES.young.INSCRIPTION_REFUSED}`, { message: body.inscriptionRefusedMessage });
          break;
        case YOUNG_STATUS.WAITING_LIST:
          await api.put(`/referent/young/${young._id}`, { status: YOUNG_STATUS.WAITING_LIST });
          await api.post(`/young/${young._id}/email/${SENDINBLUE_TEMPLATES.young.INSCRIPTION_WAITING_LIST}`);
          break;
        case YOUNG_STATUS.VALIDATED:
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

  if (!cohort) return null;

  return (
    <>
      <YoungHeader young={young} tab="file" onChange={onChange} />
      <div className="p-[30px]">
        {isPrecompte && <InfoMessage title="Cet élève pourra activer son compte à partir du module d’Engagement lors de son séjour." />}
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
          isPrecompte={isPrecompte}
          young={young}
          globalMode={globalMode}
          requests={requests}
          onStartRequest={onStartRequest}
          currentRequest={currentCorrectionRequestField}
          onCorrectionRequestChange={onCorrectionRequestChange}
          onChange={onChange}
          readonly={isResponsableDeCentre(user)}
          user={user}
        />
        <SectionParents
          young={young as any}
          isPrecompte={isPrecompte}
          globalMode={globalMode}
          requests={requests}
          onStartRequest={onStartRequest}
          currentRequest={currentCorrectionRequestField}
          onCorrectionRequestChange={onCorrectionRequestChange}
          onChange={onChange}
          oldCohort={oldCohort}
          readonly={isResponsableDeCentre(user) || user.featureFlags?.[FeatureFlagName.INSCRIPTION_EN_MASSE_CLASSE]}
        />
        {oldCohort ? (
          <SectionOldConsentements young={young} />
        ) : (
          <SectionConsentements young={young} onChange={onChange} readonly={isResponsableDeCentre(user)} isPrecompte={isPrecompte} cohort={cohort} />
        )}
      </div>
      {globalMode === "correction" && (
        <>
          {footerMode === "PENDING" && (
            <YoungFooterPending
              young={young}
              requests={requests}
              onDeletePending={deletePendingRequests}
              sending={processing}
              onSendPending={sendPendingRequests}
              footerClass={footerClass}
            />
          )}
          {footerMode === "WAITING" && <YoungFooterSent young={young} requests={requests} onRemindRequests={remindRequests} footerClass={footerClass} />}
          {footerMode === "NO_REQUEST" && <YoungFooterNoRequest young={young} processing={processing} onProcess={processRegistration} footerClass={footerClass} />}
        </>
      )}
    </>
  );
}
