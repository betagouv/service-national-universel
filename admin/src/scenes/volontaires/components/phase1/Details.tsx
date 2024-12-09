import React, { useState } from "react";
import { Container, Label } from "@snu/ds/admin";
import { YOUNG_SOURCE, getZonedDate, COHORT_TYPE, formatNameAndAddress, academyList } from "snu-lib";
import dayjs from "@/utils/dayjs.utils";
import { adminURL } from "@/config";
import Refresh from "@/assets/icons/Refresh";
import { isCohortOpenForAffectation } from "../../utils";

import PDRpropose from "../PDRpropose";
import ModalAffectations from "../ModalAffectation";
import ModalAffectationsForCLE from "../ModalAffectationsForCLE";
import ModalChangePDRSameLine from "../ModalChangePDRSameLine";

export default function Details({ cohesionCenter, meetingPoint, cohort, young, setYoung, user }) {
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [modalAffectations, setModalAffectation] = useState({ isOpen: false, center: null, sessionId: null });
  const [modalAffectationsForCLE, setModalAffectationForCLE] = useState(false);
  const [modalChangePdrSameLine, setModalChangePdrSameLine] = useState({ isOpen: false });
  const isOpenForAffectation = isCohortOpenForAffectation(user, young, cohort);

  return (
    <Container>
      {cohesionCenter ? (
        <div className="mt-4 flex flex-row items-center justify-center gap-10">
          <div className="mt-4 flex w-full flex-col items-start justify-start self-start">
            <Label title="Centre de cohésion" name="cohesionCenter" />
            <div className="mb-2 flex flex-col bg-gray-50 gap-1 py-[10px] px-4">
              <p>
                <span className="text-gray-500">Matricule : </span>
                {cohesionCenter.matricule}
              </p>
              <p>
                <span className="text-gray-500">Nom : </span>
                {cohesionCenter.name}
              </p>
              <p>
                <span className="text-gray-500">Adresse : </span>
                {cohesionCenter.address && formatNameAndAddress(cohesionCenter.address)}
                {cohesionCenter.zip + " " + (cohesionCenter.city && formatNameAndAddress(cohesionCenter.city))}
              </p>
              <p>
                <span className="text-gray-500">Département : </span>
                {cohesionCenter.department}
              </p>
              <p>
                <span className="text-gray-500">Région : </span>
                {cohesionCenter.region}
              </p>
              <p>
                <span className="text-gray-500">Académie : </span>
                {cohesionCenter.academy}
              </p>
            </div>
            {cohort.type !== COHORT_TYPE.CLE && isOpenForAffectation && editing && (
              <button
                onClick={() => setModalAffectation({ ...modalAffectations, isOpen: true })}
                className="flex w-fit cursor-pointer flex-row items-center justify-center gap-2 self-end rounded border-[1px] border-gray-300 p-2">
                <Refresh />
                <div>Changer l&apos;affectation</div>
              </button>
            )}
          </div>
          <div className="mt-4 flex w-full flex-col items-start justify-start self-start">
            {meetingPoint ? (
              <>
                <Label title="Point de rassemblement" name="meetingPoint" />
                <div className="mb-2 flex flex-col bg-gray-50 gap-1 py-[10px] px-4">
                  <p>
                    <span className="text-gray-500">Adresse : </span>
                    {cohesionCenter.address && formatNameAndAddress(meetingPoint.pointDeRassemblement.address)}
                  </p>
                  <p>
                    <span className="text-gray-500">Heure de Départ : </span>
                    {dayjs(getZonedDate(meetingPoint?.bus.departuredDate)).format("dddd D MMMM YYYY") + ", " + meetingPoint?.ligneToPoint.departureHour}
                  </p>
                  <p>
                    <span className="text-gray-500">Heure de retour : </span>
                    {dayjs(getZonedDate(meetingPoint?.bus.returnDate)).format("dddd D MMMM YYYY") + ", " + meetingPoint?.ligneToPoint.returnHour}
                  </p>
                  <p>
                    <span className="text-gray-500">N˚ transport : </span>
                    {meetingPoint?.bus.busId}
                  </p>
                </div>
              </>
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
          {cohort.type !== COHORT_TYPE.CLE && isOpenForAffectation && editing && (
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
      ) : (
        <div className="my-52 flex flex-col items-center justify-center gap-4">
          <div className="text-base font-bold text-gray-900">Ce volontaire n&apos;est affecté à aucun centre</div>
          {isOpenForAffectation && (
            <div
              className="cursor-pointer rounded bg-blue-600 px-4 py-2 text-white"
              onClick={() => {
                cohort.type === COHORT_TYPE.VOLONTAIRE ? setModalAffectation({ ...modalAffectations, isOpen: true }) : setModalAffectationForCLE(true);
              }}>
              Affecter dans un centre
            </div>
          )}
        </div>
      )}
      <ModalAffectations
        isOpen={modalAffectations?.isOpen}
        onCancel={() => setModalAffectation({ isOpen: false, center: null, sessionId: null })}
        young={young}
        cohort={cohort}
        center={modalAffectations?.center}
        sessionId={modalAffectations?.sessionId}
      />
      <ModalAffectationsForCLE isOpen={modalAffectationsForCLE} onClose={() => setModalAffectationForCLE(false)} young={young} setYoung={setYoung} />
      <ModalChangePDRSameLine isOpen={modalChangePdrSameLine?.isOpen} onCancel={() => setModalChangePdrSameLine({ isOpen: false })} young={young} cohort={cohort} />
    </Container>
  );
}
