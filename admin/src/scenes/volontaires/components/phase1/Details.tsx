import React, { useState } from "react";
import { Container, Button } from "@snu/ds/admin";
import { ROLES, COHORT_TYPE, CohesionCenterType, CohortDto, YoungType, LigneBusType, LigneToPointType, PointDeRassemblementType } from "snu-lib";
import { isCohortOpenForAffectation } from "../../utils";
import { User } from "@/types";
import Loader from "@/components/Loader";
import { Link } from "react-router-dom";

import ModalAffectations from "../ModalAffectation";
import ModalAffectationsForCLE from "../ModalAffectationsForCLE";
import ModalChangePDRSameLine from "../ModalChangePDRSameLine";
import CohesionCenterInfos from "./CohesionCenterInfos";
import TransportInfos from "./TransportInfos";

type ModalAffectationsType = {
  isOpen: boolean;
  center: CohesionCenterType | null;
  sessionId: string;
};

type meetingPointType = {
  bus: LigneBusType;
  ligneToPoint: LigneToPointType;
  pointDeRassemblement: PointDeRassemblementType;
};

interface Props {
  cohesionCenter: CohesionCenterType;
  meetingPoint: meetingPointType;
  pointDeRassemblement: PointDeRassemblementType;
  cohort: CohortDto;
  young: YoungType;
  setYoung: () => void;
  user: User;
}

export default function Details({ cohesionCenter, meetingPoint, pointDeRassemblement, cohort, young, setYoung, user }: Props) {
  const [modalAffectations, setModalAffectation] = useState<ModalAffectationsType>({
    isOpen: false,
    center: null,
    sessionId: "",
  });
  const [modalAffectationsForCLE, setModalAffectationForCLE] = useState(false);
  const [modalChangePdrSameLine, setModalChangePdrSameLine] = useState({ isOpen: false });
  const isOpenForAffectation = isCohortOpenForAffectation(user, young, cohort);
  const isYoungAffected = young.cohesionCenterId ? true : false;
  const isLigneAffected = young.ligneId ? true : false;

  const containerActionList = () => {
    if (young.hasMeetingInformation === "true") {
      return [
        <div className="flex gap-2" key="container-actions">
          <Button
            key="affectation"
            title={cohort.type === COHORT_TYPE.VOLONTAIRE ? "Affecter dans un centre" : "Affecter comme sa classe"}
            disabled
            tooltip="Ce volontaire est déjà affecté."
          />
          {isLigneAffected && [ROLES.ADMIN, ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION].includes(user.role) && (
            <Link to={`/ligne-de-bus/historique?cohort=${encodeURIComponent(young.cohort!)}&page=1&search=${meetingPoint?.bus?.busId}`} key="historique" target="_blank">
              <Button title="Voir l'historique du bus" />
            </Link>
          )}
        </div>,
      ];
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
    return [
      <Button
        key="affectation"
        title={cohort.type === COHORT_TYPE.VOLONTAIRE ? "Affecter dans un centre" : "Affecter comme sa classe"}
        disabled
        tooltip="Les affectations ne sont pas ouvertes pour ce séjour."
      />,
    ];
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
          <CohesionCenterInfos
            cohesionCenter={cohesionCenter}
            cohort={cohort}
            setModalAffectation={setModalAffectation}
            modalAffectations={modalAffectations}
            isOpenForAffectation={isOpenForAffectation}
          />
          <div className="w-[1px] mx-8 bg-gray-200 shrink-0">&nbsp;</div>
          <TransportInfos
            meetingPoint={meetingPoint}
            pointDeRassemblement={pointDeRassemblement}
            young={young}
            cohesionCenter={cohesionCenter}
            cohort={cohort}
            modalAffectations={modalAffectations}
            setModalAffectation={setModalAffectation}
            isOpenForAffectation={isOpenForAffectation}
            setModalChangePdrSameLine={setModalChangePdrSameLine}
          />
        </div>
      )}
      <ModalAffectations
        isOpen={modalAffectations.isOpen}
        onCancel={() => setModalAffectation({ isOpen: false, center: null, sessionId: "" })}
        young={young}
        cohort={cohort}
        center={modalAffectations.center}
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
