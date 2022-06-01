import React from "react";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { Hero, HeroContainer } from "../../components/Content";
import { permissionPhase2, YOUNG_STATUS_PHASE2 } from "../../utils";
import InProgressDesktop from "./desktop";
import InProgressMobile from "./mobile";
import NextStep from "./nextStep";
import Validated from "./Validated";
import WaitingRealisation from "./WaitingRealisation";

export default () => {
  const young = useSelector((state) => state.Auth.young);
  const history = useHistory();

  if (!young || !permissionPhase2(young)) history.push("/");
  const renderStep = () => {
    if (young.statusPhase2 === YOUNG_STATUS_PHASE2.WAITING_REALISATION) return <WaitingRealisation />;
    if (young.statusPhase2 === YOUNG_STATUS_PHASE2.IN_PROGRESS)
      return (
        <>
          <div className="hidden md:flex flex-1">
            <InProgressDesktop />
          </div>
          <div className="flex md:hidden ">
            <InProgressMobile />
          </div>
        </>
      );
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
