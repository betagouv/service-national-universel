import React, { useEffect, useState } from "react";
import { ImQuotesLeft } from "react-icons/im";
import { useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";

import { YOUNG_SOURCE } from "snu-lib";

import ModalConfirm from "@/components/modals/ModalConfirm";
import dayjs from "@/utils/dayjs.utils";
import ExternalLink from "@/assets/icons/ExternalLink";
import Refresh from "@/assets/icons/Refresh";
import { adminURL } from "@/config";
import { capture } from "@/sentry";
import api from "@/services/api";
import { getCohortByName } from "@/services/cohort.service";
import { youngCheckinField } from "@/utils";
import { YOUNG_STATUS_PHASE1, canAssignManually, translate } from "snu-lib";

import InfoMessage from "../../dashboardV2/components/ui/InfoMessage";
import YoungHeader from "../../phase0/components/YoungHeader";
import ModalAffectations from "../components/ModalAffectation";
import ModalChangePDRSameLine from "../components/ModalChangePDRSameLine";
import PDRpropose from "../components/PDRpropose";
import DocumentPhase1 from "../components/phase1/DocumentPhase1";
import Phase1ConfirmationFormBlock from "../components/phase1/Phase1ConfirmationFormBlock";
import Phase1Header from "../components/phase1/Phase1Header";
import Phase1PresenceFormBlock from "../components/phase1/Phase1PresenceFormBlock";

export default function Phase1(props) {
  const user = useSelector((state) => state.Auth.user);
  const [meetingPoint, setMeetingPoint] = useState();
  const [young, setYoung] = useState(props.young);
  const [cohesionCenter, setCohesionCenter] = useState();
  const [modal, setModal] = useState({ isOpen: false, onConfirm: null });
  const [modalAffectations, setModalAffectation] = useState({ isOpen: false });
  const [modalChangePdrSameLine, setModalChangePdrSameLine] = useState({ isOpen: false });
  // new useState
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [values, setValues] = useState(props.young);

  const [isCohortOpenForAffectation, setIsCohortOpenForAffection] = useState(false);
  const [cohort, setCohort] = useState();
  const [isYoungCheckinOpen, setIsYoungCheckinOpen] = useState(false);

  function getDisplayCenterButton() {
    if (young.status !== "VALIDATED" && young.status !== "WAITING_LIST") {
      setIsCohortOpenForAffection(false);
    } else if (cohort) {
      setIsCohortOpenForAffection(canAssignManually(user, young, cohort));
    } else {
      setIsCohortOpenForAffection(false);
    }
  }

  useEffect(() => {
    // --- get cohort.
    (async () => {
      try {
        const { data } = await getCohortByName(young.cohort);
        setCohort(data);
      } catch (error) {
        capture(error);
        const { title, message } = error;
        toastr.error(title, message);
        setCohort(null);
        setIsCohortOpenForAffection(false);
      }
    })();

    if (!young?.sessionPhase1Id) return;
    (async () => {
      try {
        const { data, code, ok } = await api.get(`/session-phase1/${young?.sessionPhase1Id}/cohesion-center`);
        if (!ok) return toastr.error("Impossible de récupérer les informations du centre de cohésion", translate(code));
        setCohesionCenter(data);
      } catch (err) {
        capture(err);
        toastr.error("Impossible de récupérer les informations du centre de cohésion");
      }
    })();

    if (!young.meetingPointId || !young.ligneId) return;
    (async () => {
      try {
        const { data, code, ok } = await api.get(`/point-de-rassemblement/fullInfo/${young?.meetingPointId}/${young?.ligneId}`);
        if (!ok) return toastr.error("Impossible de récupérer les informations du point de rassemblement", translate(code));
        setMeetingPoint(data);
      } catch (err) {
        capture(err);
        toastr.error("Impossible de récupérer les informations du point de rassemblement");
      }
    })();
  }, []);

  useEffect(() => {
    getDisplayCenterButton();

    if (cohort) {
      const field = youngCheckinField[user.role];
      if (field) {
        setIsYoungCheckinOpen(cohort[field] ? cohort[field] : false);
      } else {
        setIsYoungCheckinOpen(false);
      }
    } else {
      setIsYoungCheckinOpen(false);
    }
  }, [cohort]);

  return (
    <>
      <YoungHeader young={props.young} tab="phase1" onChange={props.onChange} />
      <div className="p-[30px]">
        {meetingPoint?.bus?.delayedForth === "true" || meetingPoint?.bus?.delayedBack === "true" ? (
          <InfoMessage
            priority="important"
            message={`Le départ de la ligne de bus de ce jeune est retardé ${
              meetingPoint?.bus?.delayedForth === "true" && meetingPoint?.bus?.delayedBack === "true"
                ? "à l'Aller et au Retour"
                : meetingPoint?.bus?.delayedForth === "true"
                  ? "à l'Aller"
                  : "au Retour"
            }.`}
          />
        ) : null}
        <div className="mt-[30px] rounded bg-white shadow-[0px_8px_16px_-3px_rgba(0,0,0,0.05)]">
          <div className="mx-8 py-4">
            <Phase1Header user={user} young={young} setYoung={setYoung} editing={editing} setEditing={setEditing} loading={loading} setLoading={setLoading} setValues={setValues} />
            <div className="grid grid-cols-2">
              <Phase1ConfirmationFormBlock
                className="col-start-1 border-r-[1px] border-gray-200 pr-11"
                young={young}
                setYoung={setYoung}
                editing={editing}
                values={values}
                setValues={setValues}
                setLoading={setLoading}
              />
              <Phase1PresenceFormBlock
                className="col-start-2 pl-11"
                young={young}
                setYoung={setYoung}
                editing={editing}
                values={values}
                setValues={setValues}
                setLoading={setLoading}
                isYoungCheckinOpen={isYoungCheckinOpen}
              />
            </div>

            {young.departSejourAt ? (
              <div className="mt-4 flex flex-row items-center rounded bg-blue-100 px-3 py-2 text-blue-600">
                <div className="w-1/2 font-bold">{young.departSejourMotif}</div>
                {young.departSejourMotifComment ? (
                  <div className="flex w-1/2 flex-row items-center justify-start gap-2">
                    <ImQuotesLeft />
                    <div>{young.departSejourMotifComment}</div>
                  </div>
                ) : null}
              </div>
            ) : null}

            {cohesionCenter ? (
              <div className="mt-4 flex flex-row items-center justify-center gap-10">
                <div className="mt-4 flex w-full flex-col items-start justify-start self-start">
                  <div className="mb-2 text-xs font-medium text-gray-900">Centre de cohésion</div>
                  <div className="mb-4 flex w-full flex-col gap-4">
                    <Field title="Code centre" value={cohesionCenter.code2022} externalLink={`${adminURL}/centre/${cohesionCenter?._id}?cohorte=${young.cohort}`} />
                    <Field title="Nom" value={cohesionCenter.name} />
                    <Field title="Code postal" value={cohesionCenter.zip} />
                    <Field title="Ville" value={cohesionCenter.city} />
                  </div>
                  {isCohortOpenForAffectation && editing && (
                    <button
                      onClick={() => setModalAffectation({ isOpen: true })}
                      className="flex w-fit cursor-pointer flex-row items-center justify-center gap-2 self-end rounded border-[1px] border-gray-300 p-2">
                      <Refresh />
                      <div>Changer l&apos;affectation</div>
                    </button>
                  )}
                </div>
                <div className="mt-4 flex w-full flex-col items-start justify-start self-start">
                  <div className="mb-2 text-xs font-medium text-gray-900">Point de rassemblement</div>
                  <div className="mb-4 flex w-full flex-col gap-4 text-sm text-gray-800 ">
                    {meetingPoint ? (
                      <div className="flex flex-col gap-4">
                        <Field
                          title="Adresse"
                          value={meetingPoint?.pointDeRassemblement.address}
                          externalLink={`${adminURL}/point-de-rassemblement/${meetingPoint?.pointDeRassemblement._id}`}
                        />
                        <Field
                          title="Heure&nbsp;de&nbsp;départ"
                          value={dayjs(meetingPoint?.bus.departuredDate).format("dddd D MMMM YYYY") + ", " + meetingPoint?.ligneToPoint.departureHour}
                        />
                        <Field
                          title="Heure&nbsp;de&nbsp;retour"
                          value={dayjs(meetingPoint?.bus.returnDate).format("dddd D MMMM YYYY") + ", " + meetingPoint?.ligneToPoint.returnHour}
                        />
                        <Field title="N˚&nbsp;transport" value={meetingPoint?.bus.busId} externalLink={`${adminURL}/ligne-de-bus/${meetingPoint?.bus._id}`} />
                      </div>
                    ) : young?.transportInfoGivenByLocal === "true" ? (
                      <div>Les informations de transport seront transmises par email.</div>
                    ) : young?.deplacementPhase1Autonomous === "true" ? (
                      <div>{young.firstName} se rend au centre et en revient par ses propres moyens.</div>
                    ) : young?.source === YOUNG_SOURCE.CLE ? (
                      <>
                        <div>Le point de rassemblement n&apos;a pas été confirmé par le référent régional.</div>
                      </>
                    ) : editing ? (
                      <>
                        <div>{young.firstName} n&apos;a pas encore confirmé son point de rassemblement.</div>
                      </>
                    ) : (
                      <>
                        <div>{young.firstName} n&apos;a pas encore confirmé son point de rassemblement. Voici le(s) point(s) de rassemblement proposé(s) :</div>

                        <PDRpropose young={young} center={cohesionCenter} modalAffectations={modalAffectations} setModalAffectation={setModalAffectation}></PDRpropose>
                      </>
                    )}
                  </div>
                  {isCohortOpenForAffectation && editing && (
                    <div className="flex items-center gap-3 !justify-end w-full">
                      <button
                        onClick={() => setModalAffectation({ isOpen: true, center: cohesionCenter, sessionId: young.sessionPhase1Id })}
                        className="flex cursor-pointer flex-row items-center justify-center gap-2 rounded border-[1px] border-gray-300 p-2">
                        {meetingPoint || young.deplacementPhase1Autonomous === "true" || young.transportInfoGivenByLocal === "true" ? (
                          <>
                            <Refresh />
                            <div>Changer le PDR</div>
                          </>
                        ) : (
                          <div>Choisir un PDR</div>
                        )}
                      </button>
                      {young.meetingPointId && young.ligneId && (
                        <button
                          className="flex cursor-pointer flex-row items-center justify-center gap-2  rounded border-[1px] border-gray-300 p-2"
                          onClick={() => setModalChangePdrSameLine({ isOpen: true })}>
                          <Refresh />
                          <div>Changer le PDR sur la ligne</div>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="my-52 flex flex-col items-center justify-center gap-4">
                <div className="text-base font-bold text-gray-900">Ce volontaire n&apos;est affecté à aucun centre</div>
                {isCohortOpenForAffectation && (
                  <div
                    className="cursor-pointer rounded bg-blue-600 px-4 py-2 text-white"
                    onClick={() => {
                      setModalAffectation({ isOpen: true });
                    }}>
                    Affecter dans un centre
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        {young.statusPhase1 === YOUNG_STATUS_PHASE1.WAITING_AFFECTATION ||
        young.statusPhase1 === YOUNG_STATUS_PHASE1.AFFECTED ||
        young.statusPhase1 === YOUNG_STATUS_PHASE1.DONE ? (
          <div className="mt-4 rounded bg-white">
            <div className="mx-8 py-4">
              <div className="mr-2 text-lg font-medium">Documents</div>
              <DocumentPhase1 young={young} />
            </div>
          </div>
        ) : null}
      </div>
      <ModalConfirm
        isOpen={modal?.isOpen}
        title={modal?.title}
        message={modal?.message}
        onCancel={() => setModal({ isOpen: false, onConfirm: null })}
        onConfirm={() => {
          modal?.onConfirm();
          setModal({ isOpen: false, onConfirm: null });
        }}
      />
      <ModalAffectations
        isOpen={modalAffectations?.isOpen}
        onCancel={() => setModalAffectation({ isOpen: false })}
        young={young}
        cohort={cohort}
        center={modalAffectations?.center}
        sessionId={modalAffectations?.sessionId}
      />
      <ModalChangePDRSameLine isOpen={modalChangePdrSameLine?.isOpen} onCancel={() => setModalChangePdrSameLine({ isOpen: false })} young={young} cohort={cohort} />
    </>
  );
}

const Field = ({ title, value, externalLink }) => {
  return (
    <div key={title} className="flex flex-col rounded border-[1px] border-gray-300 p-2">
      <div className="text-xs text-gray-500">{title}</div>

      {externalLink ? (
        <a target="_blank" rel="noreferrer" href={externalLink}>
          <div className="flex flex-row items-center justify-start gap-1">
            <div className="h-[20px] text-sm text-gray-800">{value}</div>
            <ExternalLink className="font-bold leading-5 text-[#9CA3AF]" />
          </div>
        </a>
      ) : (
        <div className="h-[20px] text-sm text-gray-800">{value}</div>
      )}
    </div>
  );
};
