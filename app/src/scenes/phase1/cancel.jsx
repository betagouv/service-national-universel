import React from "react";
import useAuth from "@/services/useAuth";
import HomeContainer from "@/components/layout/HomeContainer";
import HomeHeader from "@/components/layout/HomeHeader";
import { YOUNG_STATUS_PHASE1_MOTIF, translate } from "../../utils";
import hero from "../../assets/hero/phase1.png";

export default function Cancel() {
  const { young } = useAuth();
  const title = `${young.firstName}, vous avez été ${young.gender === "female" ? "dispensée " : "dispensé "} de séjour de cohésion`;

  return (
    <HomeContainer>
      <HomeHeader title={title} img={hero}>
        {young.statusPhase1Motif ? (
          <p className="mt-8 text-gray-500">
            Motif : {young.statusPhase1Motif === YOUNG_STATUS_PHASE1_MOTIF.OTHER ? `${young.statusPhase1MotifDetail}` : `${translate(young.statusPhase1Motif)}`}
          </p>
        ) : null}
        <p className="mt-4 italic">
          Si vous n&apos;avez pas réalisé votre JDC, nous vous invitons à vous inscrire sur{" "}
          <a href="http://majdc.fr" target="_blank" rel="noreferrer" className="underline">
            majdc.fr
          </a>{" "}
          et à demander à être convoqué pour une session en ligne.
        </p>
      </HomeHeader>
    </HomeContainer>
  );
}
