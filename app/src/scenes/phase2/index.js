import React from "react";
import NextStep from "./nextStep";
import { YOUNG_STATUS_PHASE2 } from "../../utils";
import { useSelector } from "react-redux";
import WaitingRealisation from "./WaitingRealisation";
import InProgress from "./InProgress";
import Validated from "./Validated";
import { HeroContainer, Hero } from "../../components/Hero";

export default () => {
  const young = useSelector((state) => state.Auth.young) || {};

  const renderStep = () => {
    if (young.statusPhase2 === YOUNG_STATUS_PHASE2.WAITING_REALISATION) return <WaitingRealisation />;
    if (young.statusPhase2 === YOUNG_STATUS_PHASE2.IN_PROGRESS) return <InProgress />;
    if (young.statusPhase2 === YOUNG_STATUS_PHASE2.VALIDATED) return <Validated />;
    return (
      <>
        <HeroContainer>
          <Hero>
            <div className="content">
              <h1>
                Réalisez votre <strong>mission d'intérêt général</strong>
              </h1>
              <p>
                Partez à la découverte de l'engagement en réalisant 84 heures de mission d'intérêt général, au sein d'une ou plusieurs structures, en contribuant à leurs activités
                concrètes !
              </p>
              <p>A vous de jouez : candidatez directement sur des missions parmi celles proposées dans cet espace !</p>
            </div>
            <div className="thumb" />
          </Hero>
          <NextStep />
        </HeroContainer>
      </>
    );
  };

  return renderStep();
};
