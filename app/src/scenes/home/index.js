import React, { useEffect } from "react";
import { useSelector } from "react-redux";

import { YOUNG_STATUS } from "../../utils";
import WaitingValidation from "./waitingValidation";
import WaitingCorrection from "./waitingCorrection";
import Refused from "./refused";
import Default from "./default";
import Withdrawn from "./withdrawn";
import WaitingList from "./waitingList";
import Validated from "./validated";
import Reinscription from "./reinscription";

export default () => {
  const young = useSelector((state) => state.Auth.young) || {};

  const renderStep = () => {
    if (young.cohort === "2022") {
      if (young.status === YOUNG_STATUS.WITHDRAWN) return <Withdrawn />;
      if (young.status === YOUNG_STATUS.WAITING_CORRECTION) return <WaitingCorrection />;
      if (young.status === YOUNG_STATUS.WAITING_VALIDATION) return <WaitingValidation />;
      if (young.status === YOUNG_STATUS.WAITING_LIST) return <WaitingList />;
      if (young.status === YOUNG_STATUS.REFUSED) return <Refused />;
      if (young.status === YOUNG_STATUS.VALIDATED) return <Validated />;
    } else if (young.status === YOUNG_STATUS.REFUSED && young.cohort === "2021") {
      // screen for re-inscription
      return <Reinscription />;
    } else return <Default />;
  };

  return renderStep();
};
