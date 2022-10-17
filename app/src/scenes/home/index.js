import React from "react";
import { useSelector } from "react-redux";

import { YOUNG_STATUS, YOUNG_STATUS_PHASE1, YOUNG_STATUS_PHASE2 } from "../../utils";
import WaitingValidation from "./waitingValidation";
import WaitingCorrection from "./waitingCorrection";
import Refused from "./refused";
import Default from "./default";
import Withdrawn from "./withdrawn";
import WaitingList from "./waitingList";
import Validated from "./validated";
import Banner from "./components/banner";
import HomePhase2 from "./HomePhase2";
import { environment } from "../../config";
import WaitingPhase1Reinscription from "./WaitingPhase1Reinscription";
import WaitingPhase1 from "./WaitingPhase1";

export default () => {
  const young = useSelector((state) => state.Auth.young) || {};

  const renderStep = () => {
    if (young.status === YOUNG_STATUS.ABANDONED)
      return (
        <>
          {young.cohort === "2021" ? <Banner /> : null}
          <Withdrawn />
        </>
      );
    if (young.status === YOUNG_STATUS.WITHDRAWN)
      return (
        <>
          {young.cohort === "2021" ? <Banner /> : null}
          <Withdrawn />
        </>
      );
    // if (young.status === YOUNG_STATUS.WAITING_LIST)
    //   return (
    //     <>
    //       {young.cohort === "2021" ? <Banner /> : null}
    //       {environment !== "production" ? <WaitingPhase1Reinscription /> : <WaitingList />}
    //     </>
    //   );
    // if (young.status === YOUNG_STATUS.REFUSED)
    //   return (
    //     <>
    //       {young.cohort === "2021" ? <Banner /> : null}
    //       <Refused />
    //     </>
    //   );
    if (environment !== "production") return <WaitingPhase1 />;
    if (["2022", "à venir"].includes(young.cohort)) {
      // they are in the new cohort, we display the inscription step
      if (young.status === YOUNG_STATUS.WAITING_CORRECTION) return <WaitingCorrection />;
      if (young.status === YOUNG_STATUS.WAITING_VALIDATION) return <WaitingValidation />;
      if (young.status === YOUNG_STATUS.VALIDATED) return <Validated />;
    }
    if (
      young.status === YOUNG_STATUS.VALIDATED &&
      [YOUNG_STATUS_PHASE1.DONE, YOUNG_STATUS_PHASE1.EXEMPTED].includes(young.statusPhase1) &&
      [YOUNG_STATUS_PHASE2.IN_PROGRESS, YOUNG_STATUS_PHASE2.WAITING_REALISATION].includes(young.statusPhase2)
    )
      return <HomePhase2 />;

    return <Default />;
  };

  return renderStep();
};
