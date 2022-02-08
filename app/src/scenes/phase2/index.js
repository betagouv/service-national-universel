import React from "react";
import NextStep from "./nextStep";
import { YOUNG_STATUS_PHASE2, permissionPhase2 } from "../../utils";
import { useSelector } from "react-redux";
import WaitingRealisation from "./WaitingRealisation";
import InProgress from "./InProgress";
import Validated from "./Validated";
import { HeroContainer, Hero } from "../../components/Content";
import { useHistory } from "react-router-dom";

export default () => {
  const young = useSelector((state) => state.Auth.young);
  const history = useHistory();

  if (!young || !permissionPhase2(young)) history.push("/");
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
                Réalisez votre <strong>mission d&apos;intérêt général</strong>
              </h1>
              <p>
                Partez à la découverte de l&apos;engagement en réalisant 84 heures de mission d&apos;intérêt général, au sein d&apos;une ou plusieurs structures, en contribuant à
                leurs activités concrètes !
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
