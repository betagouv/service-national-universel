import React from "react";
import useAuth from "@/services/useAuth";
import HomeContainer from "@/components/layout/HomeContainer";
import HomeHeader from "@/components/layout/HomeHeader";
import hero from "../../assets/hero/home.png";
import JDMA from "@/components/JDMA";
import EngagementPrograms from "../preinscription/components/EngagementPrograms";

export default function EnAttente() {
  const { young } = useAuth();

  return (
    <HomeContainer>
      <HomeHeader title={`${young.firstName}, vous n’avez pas réalisé le séjour de cohésion.`} img={hero}></HomeHeader>
      <br />
      <hr />
      <EngagementPrograms />

      <div className="mt-12 flex justify-end">
        <JDMA id={3154} />
      </div>
    </HomeContainer>
  );
}
