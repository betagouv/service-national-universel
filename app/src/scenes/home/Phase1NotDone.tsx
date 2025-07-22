import useAuth from "@/services/useAuth";
import React from "react";
import hero from "../../assets/hero/home.png";
import Engagement from "./components/Engagement";
import HomeHeader from "@/components/layout/HomeHeader";
import HomeContainer from "@/components/layout/HomeContainer";

export default function HorsParcours() {
  const { young } = useAuth();
  return (
    <HomeContainer>
      <HomeHeader title={`${young.firstName}, vous n’avez pas réalisé le séjour de cohésion.`} img={hero}></HomeHeader>
      <br />
      <hr />
      <Engagement />
    </HomeContainer>
  );
}
