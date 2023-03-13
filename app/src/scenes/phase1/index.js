import React from "react";
import { useSelector } from "react-redux";

import Done from "./done.js";
import Affected from "./affected.js";
import Cancel from "./cancel.js";
import NotDone from "./notDone.js";
import WaitingAffectation from "./waitingAffectation.js";
import WaitingList from "./waitingList.js";
import { YOUNG_STATUS_PHASE1, permissionPhase1 } from "../../utils";
import { HeroContainer, Hero } from "../../components/Content";
import { useHistory } from "react-router-dom";
import { cohortAssignmentAnnouncementsIsOpenForYoung } from "../../utils/cohorts";

export default () => {
  const young = useSelector((state) => state.Auth.young);
  const history = useHistory();

  if (!young || !permissionPhase1(young)) history.push("/");

  const renderStep = () => {
    if (young.statusPhase1 === YOUNG_STATUS_PHASE1.DONE) return <Done />;
    if (young.statusPhase1 === YOUNG_STATUS_PHASE1.AFFECTED) {
      if (cohortAssignmentAnnouncementsIsOpenForYoung(young.cohort)) {
        return <Affected />;
      } else {
        return <WaitingAffectation young={young} />;
      }
    }
    if (young.statusPhase1 === YOUNG_STATUS_PHASE1.EXEMPTED && young.cohesion2020Step !== "DONE") return <Cancel />;
    if (young.statusPhase1 === YOUNG_STATUS_PHASE1.NOT_DONE) return <NotDone />;
    if (young.statusPhase1 === YOUNG_STATUS_PHASE1.WAITING_AFFECTATION) return <WaitingAffectation young={young} />;
    if (young.statusPhase1 === YOUNG_STATUS_PHASE1.WAITING_LIST) {
      if (cohortAssignmentAnnouncementsIsOpenForYoung(young.cohort)) {
        return <WaitingList young={young} />;
      } else {
        return <WaitingAffectation young={young} />;
      }
    }
    return (
      <>
        <HeroContainer>
          <Hero>
            <div className="content">
              <h1>
                <strong>Mon séjour de cohésion</strong>
              </h1>
              <p>
                Le SNU vous donne l&apos;opportunité de découvrir la vie collective au sein d&apos;un centre accueillant environ 200 jeunes de votre région pour créer ainsi des
                liens nouveaux et développer votre culture de l&apos;engagement et ainsi affirmer votre place dans la société.
              </p>
            </div>
            <div className="thumb" />
          </Hero>
        </HeroContainer>
      </>
    );
  };

  return renderStep();
};
