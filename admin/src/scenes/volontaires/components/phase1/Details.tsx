import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Container, Label, Button } from "@snu/ds/admin";
import {
  YOUNG_SOURCE,
  getZonedDate,
  COHORT_TYPE,
  formatNameAndAddress,
  CohesionCenterType,
  CohortType,
  YoungType,
  LigneBusType,
  LigneToPointType,
  PointDeRassemblementType,
} from "snu-lib";
import dayjs from "@/utils/dayjs.utils";
import Refresh from "@/assets/icons/Refresh";
import { isCohortOpenForAffectation } from "../../utils";

import PDRpropose from "../PDRpropose";
import ModalAffectations from "../ModalAffectation";
import ModalAffectationsForCLE from "../ModalAffectationsForCLE";
import ModalChangePDRSameLine from "../ModalChangePDRSameLine";
import { User } from "@/types";
import Loader from "@/components/Loader";
interface meetingPointType {
  bus: LigneBusType;
  ligneToPoint: LigneToPointType;
  pointDeRassemblement: PointDeRassemblementType;
}

interface Props {
  cohesionCenter: CohesionCenterType;
  meetingPoint: meetingPointType;
  cohort: CohortType;
  young: YoungType;
  setYoung: () => void;
  user: User;
}

export default function Details({ cohesionCenter, meetingPoint, cohort, young, setYoung, user }: Props) {
  const [modalAffectations, setModalAffectation] = useState({ isOpen: false, center: null, sessionId: "" });
  const [modalAffectationsForCLE, setModalAffectationForCLE] = useState(false);
  const [modalChangePdrSameLine, setModalChangePdrSameLine] = useState({ isOpen: false });
  const isOpenForAffectation = isCohortOpenForAffectation(user, young, cohort);
  const isYoungAffected = young.cohesionCenterId ? true : false;

  const containerActionList = () => {
    if (isYoungAffected) {
      return [];
    }
    if (isOpenForAffectation) {
      return [
        <Button
          key="affectation"
          title={cohort.type === COHORT_TYPE.VOLONTAIRE ? "Affecter dans un centre" : "Affecter comme sa classe"}
          onClick={() => {
            cohort.type === COHORT_TYPE.VOLONTAIRE ? setModalAffectation({ ...modalAffectations, isOpen: true }) : setModalAffectationForCLE(true);
          }}
        />,
      ];
    }
    return [];
  };

  return (
    <Container title="Détails" actions={containerActionList()}>
      {!isYoungAffected ? (
        <div className="w-full mx-auto flex justify-center mb-4">
          <p className="text-lg leading-7 font-medium text-gray-400">Ce volontaire n’est affecté à aucun centre</p>
        </div>
      ) : !cohesionCenter ? (
        <Loader />
      ) : (
        <div className="mt-4 flex">
          <div className="flex flex-col w-full">
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
                {cohesionCenter.address && formatNameAndAddress(cohesionCenter.address) + " "}
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
            <Link to={`/centre/${cohesionCenter._id}`} className="w-full" target="blank">
              <Button type="tertiary" title="Voir le centre" className="w-full max-w-none" />
            </Link>

            {cohort.type !== COHORT_TYPE.CLE && isOpenForAffectation && (
              <button
                onClick={() => setModalAffectation({ ...modalAffectations, isOpen: true })}
                className="flex w-fit mt-4 cursor-pointer flex-row items-center justify-center gap-2 self-center rounded border-[1px] border-gray-300 p-2">
                <Refresh />
                <div>Changer l&apos;affectation</div>
              </button>
            )}
          </div>
          <div className="w-[1px] mx-8 bg-gray-200 shrink-0">&nbsp;</div>
          <div className="flex flex-col w-full">
            {meetingPoint ? (
              <>
                <div>
                  <Label title="Point de rassemblement" name="meetingPoint" />
                  <div className="mb-2 flex flex-col bg-gray-50 gap-1 py-[10px] px-4">
                    <p>
                      <span className="text-gray-500">Nom : </span>
                      {meetingPoint.pointDeRassemblement.name}
                    </p>
                    <p>
                      <span className="text-gray-500">Adresse : </span>
                      {meetingPoint.pointDeRassemblement.address && formatNameAndAddress(meetingPoint.pointDeRassemblement.address) + " "}
                      {meetingPoint.pointDeRassemblement.zip + " " + (meetingPoint.pointDeRassemblement.city && formatNameAndAddress(meetingPoint.pointDeRassemblement.city))}
                    </p>
                    <p>
                      <span className="text-gray-500">Département : </span>
                      {meetingPoint.pointDeRassemblement.department}
                    </p>
                    <p>
                      <span className="text-gray-500">Région : </span>
                      {meetingPoint.pointDeRassemblement.region}
                    </p>
                  </div>
                  <Link to={`/point-de-rassemblement/${meetingPoint.pointDeRassemblement._id}`} className="w-full" target="blank">
                    <Button type="tertiary" title="Voir le point de rassemblement" className="w-full max-w-none" />
                  </Link>
                </div>
                <div className="mb-3 mt-2 flex flex-col bg-gray-50 gap-1 py-[10px] px-4">
                  <p>
                    <span className="text-gray-500">Heure de Départ : </span>
                    {dayjs(getZonedDate(meetingPoint?.bus.departuredDate)).format("dddd D MMMM YYYY") + ", " + meetingPoint?.ligneToPoint.departureHour}
                  </p>
                  <p>
                    <span className="text-gray-500">Heure de retour : </span>
                    {dayjs(getZonedDate(meetingPoint?.bus.returnDate)).format("dddd D MMMM YYYY") + ", " + meetingPoint?.ligneToPoint.returnHour}
                  </p>
                </div>
                <div>
                  <Label title="Transport" name="transport" />
                  <div className="mb-2 flex flex-col bg-gray-50 gap-1 py-[10px] px-4">
                    <p>
                      <span className="text-gray-500">N˚ transport : </span>
                      {meetingPoint?.bus.busId}
                    </p>
                  </div>
                  <Link to={`/ligne-de-bus/${meetingPoint.bus._id}`} className="w-full" target="blank">
                    <Button type="tertiary" title="Voir la ligne de bus" className="w-full max-w-none" />
                  </Link>
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
            ) : (
              <>
                <div>{young.firstName} n&apos;a pas encore confirmé son point de rassemblement. Voici le(s) point(s) de rassemblement proposé(s) :</div>

                <PDRpropose young={young} center={cohesionCenter} modalAffectations={modalAffectations} setModalAffectation={setModalAffectation}></PDRpropose>
              </>
            )}
            {cohort.type !== COHORT_TYPE.CLE && isOpenForAffectation && (
              <div className="flex items-center gap-3 mt-4 justify-center w-full">
                <button
                  onClick={() => setModalAffectation({ isOpen: true, center: cohesionCenter as any, sessionId: young.sessionPhase1Id ?? "" })}
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
      )}
      <ModalAffectations
        isOpen={modalAffectations.isOpen}
        onCancel={() => setModalAffectation({ isOpen: false, center: null, sessionId: "" })}
        young={young}
        cohort={cohort}
        center={modalAffectations.center ?? undefined}
        sessionId={modalAffectations.sessionId ?? null}
      />
      <ModalAffectationsForCLE
        isOpen={modalAffectationsForCLE}
        onClose={() => setModalAffectationForCLE(false)}
        young={{ ...young, classeId: young.classeId || "" }}
        setYoung={setYoung}
      />
      <ModalChangePDRSameLine isOpen={modalChangePdrSameLine?.isOpen} onCancel={() => setModalChangePdrSameLine({ isOpen: false })} young={young} cohort={cohort} />
    </Container>
  );
}
