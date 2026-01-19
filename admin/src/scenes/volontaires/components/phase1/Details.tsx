import React, { useState } from "react";
import { Container } from "@snu/ds/admin";
import { CohesionCenterType, CohortDto, YoungType, LigneBusType, LigneToPointType, PointDeRassemblementType } from "snu-lib";
import { isCohortOpenForAffectation } from "../../utils";
import { User } from "@/types";
import Loader from "@/components/Loader";

import ModalAffectations from "../ModalAffectation";
import ModalAffectationsForCLE from "../ModalAffectationsForCLE";
import ModalChangePDRSameLine from "../ModalChangePDRSameLine";
import CohesionCenterInfos from "./CohesionCenterInfos";

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
  cohort: CohortDto;
  young: YoungType;
  setYoung: () => void;
  user: User;
}

export default function Details({ cohesionCenter, cohort, young, setYoung, user }: Props) {
  const [modalAffectations, setModalAffectation] = useState<ModalAffectationsType>({
    isOpen: false,
    center: null,
    sessionId: "",
  });
  const [modalAffectationsForCLE, setModalAffectationForCLE] = useState(false);
  const [modalChangePdrSameLine, setModalChangePdrSameLine] = useState({ isOpen: false });
  const isOpenForAffectation = isCohortOpenForAffectation(user, young, cohort);
  const isYoungAffected = young.cohesionCenterId ? true : false;

  return (
    <Container title="Détails">
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
