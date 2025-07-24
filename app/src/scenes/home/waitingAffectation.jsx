import hero from "../../assets/hero/home.png";
import React from "react";
import useAuth from "@/services/useAuth";
import HomeContainer from "@/components/layout/HomeContainer";
import HomeHeader from "@/components/layout/HomeHeader";
import EngagementPrograms from "../preinscription/components/EngagementPrograms";

export default function WaitingAffectation() {
  const { young } = useAuth();

  return (
    <HomeContainer>
      <HomeHeader title={`${young.firstName}, vous n’avez pas réalisé le séjour de cohésion.`} img={hero}></HomeHeader>
      <br />
      <hr />
      <EngagementPrograms />
    </HomeContainer>
  );
}
