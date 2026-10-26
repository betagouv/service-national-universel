import React from "react";
import { Container } from "@snu/ds/admin";
import { CohesionCenterType, YoungType } from "snu-lib";
import Loader from "@/components/Loader";

import CohesionCenterInfos from "./CohesionCenterInfos";

interface Props {
  cohesionCenter: CohesionCenterType;
  young: YoungType;
}

// Consultation seule : l'affectation manuelle et le changement de point de rassemblement ont été supprimés.
export default function Details({ cohesionCenter, young }: Props) {
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
          <CohesionCenterInfos cohesionCenter={cohesionCenter} />
        </div>
      )}
    </Container>
  );
}
