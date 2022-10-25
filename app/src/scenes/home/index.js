import React from "react";
import { useSelector } from "react-redux";

import { YOUNG_STATUS, YOUNG_STATUS_PHASE1, YOUNG_STATUS_PHASE2 } from "../../utils";
import WaitingValidation from "./waitingValidation";
import WaitingCorrection from "./waitingCorrection";
import Refused from "./refused";
import Default from "./default";
import Withdrawn from "./withdrawn";
import WaitingList from "./waitingList";
import ValidatedV2 from "./validatedV2";
import Banner from "./components/banner";
import HomePhase2 from "./HomePhase2";
import { environment } from "../../config";
import WaitingReinscription from "./WaitingReinscription";
import WaitingCorrectionV2 from "./waitingCorrectionV2";

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
    if (
      (young.status === YOUNG_STATUS.WAITING_LIST && environment !== "production" && [("2019", "2020", "2021")].includes(young.cohort)) ||
      (young.status === YOUNG_STATUS.WAITING_LIST && environment === "production")
    )
      return (
        <>
          {young.cohort === "2021" ? <Banner /> : null}
          <WaitingList />
        </>
      );
    if (young.status === YOUNG_STATUS.REFUSED)
      return (
        <>
          {young.cohort === "2021" ? <Banner /> : null}
          <Refused />
        </>
      );
    if (
      environment !== "production" &&
      [YOUNG_STATUS.VALIDATED, YOUNG_STATUS.WAITING_LIST].includes(young.status) &&
      ["2022", "Février 2022", "Juin 2022", "Juillet 2022", "à venir"].includes(young.cohort) &&
      (young.cohort === "à venir" || young.status === YOUNG_STATUS.WAITING_LIST || (young.statusPhase1 === YOUNG_STATUS_PHASE1.NOT_DONE && young.departInform == null))
    ) {
      return <WaitingReinscription />;
    }
    if (["Février 2023 - C", "Avril 2023 - B", "Avril 2023 - A", "Juin 2023", "Juillet 2023"].includes(young.cohort)) {
      // they are in the new cohort, we display the inscription step
      if (young.status === YOUNG_STATUS.WAITING_CORRECTION) return <WaitingCorrectionV2 />;
      if (young.status === YOUNG_STATUS.WAITING_VALIDATION) return <WaitingValidation />;
      if (young.status === YOUNG_STATUS.VALIDATED) return <ValidatedV2 />;
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
