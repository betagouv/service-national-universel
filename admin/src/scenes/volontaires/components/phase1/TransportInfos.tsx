import React from "react";
import { Link } from "react-router-dom";
import dayjs from "@/utils/dayjs.utils";

import { Label, Button } from "@snu/ds/admin";
import {
  COHORT_TYPE,
  formatNameAndAddress,
  YOUNG_SOURCE,
  getZonedDate,
  YoungType,
  CohesionCenterType,
  CohortDto,
  LigneBusType,
  LigneToPointType,
  PointDeRassemblementType,
} from "snu-lib";
import Refresh from "@/assets/icons/Refresh";

import PDRpropose from "../PDRpropose";

type meetingPointType = {
  bus: LigneBusType;
  ligneToPoint: LigneToPointType;
  pointDeRassemblement: PointDeRassemblementType;
};

type ModalAffectationsType = {
  isOpen: boolean;
  center: CohesionCenterType | null;
  sessionId: string;
};

interface Props {
  meetingPoint: meetingPointType;
  pointDeRassemblement: PointDeRassemblementType;
  young: YoungType;
  cohesionCenter: CohesionCenterType;
  cohort: CohortDto;
  modalAffectations: ModalAffectationsType;
  setModalAffectation: (modalAffectations: ModalAffectationsType) => void;
  isOpenForAffectation: boolean;
  setModalChangePdrSameLine: (arg: { isOpen: boolean }) => void;
}

export default function TransportInfos({
  meetingPoint,
  pointDeRassemblement,
  young,
  cohesionCenter,
  cohort,
  modalAffectations,
  setModalAffectation,
  isOpenForAffectation,
  setModalChangePdrSameLine,
}: Props) {
  return (
    <div className="flex flex-col w-full">
      {pointDeRassemblement ? (
        <div>
          <Label title="Point de rassemblement" name="meetingPoint" />
          <div className="mb-2 flex flex-col bg-gray-50 gap-1 py-[10px] px-4">
            <p>
              <span className="text-gray-500">Nom : </span>
              {pointDeRassemblement.name}
            </p>
            <p>
              <span className="text-gray-500">Adresse : </span>
              {pointDeRassemblement.address && formatNameAndAddress(pointDeRassemblement.address) + " "}
              {pointDeRassemblement.zip + " " + (pointDeRassemblement.city && formatNameAndAddress(pointDeRassemblement.city))}
            </p>
            <p>
              <span className="text-gray-500">Département : </span>
              {pointDeRassemblement.department}
            </p>
            <p>
              <span className="text-gray-500">Région : </span>
              {pointDeRassemblement.region}
            </p>
          </div>
          <Link to={`/point-de-rassemblement/${pointDeRassemblement._id}`} className="w-full" target="blank">
            <Button type="tertiary" title="Voir le point de rassemblement" className="w-full max-w-none" />
          </Link>
        </div>
      ) : meetingPoint ? (
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
  );
}
