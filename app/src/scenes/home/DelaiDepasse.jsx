import React from "react";
import Engagement from "./components/Engagement";
import useAuth from "@/services/useAuth";
import Loader from "@/components/Loader";
import HomeContainer from "@/components/layout/HomeContainer";
import HomeHeader from "@/components/layout/HomeHeader";
import hero from "../../assets/hero/home.png";

export default function DelaiDepasse() {
  const { young } = useAuth();
  const title = `${young.firstName}, votre Phase 2 n'a pas été validée.`;

  if (!young) return <Loader />;

  return (
    <HomeContainer>
      <HomeHeader title={title} img={hero}>
        <p className="mt-6 text-gray-700 font-semibold">Le délai pour réaliser une mission d'intérêt général a été dépassé.</p>
        <p className="mt-3 text-gray-700">Nous vous proposons de découvrir les autres formes d’engagement possible.</p>
      </HomeHeader>
      <br />
      <Engagement />
    </HomeContainer>
  );
}
