import React from "react";
import { useSelector } from "react-redux";

import { YOUNG_STATUS } from "../../utils";
import WaitingValidation from "./waitingValidation";
import WaitingCorrection from "./waitingCorrection";
import Refused from "./refused";
import Default from "./default";
import Withdrawn from "./withdrawn";
import WaitingList from "./waitingList";
import Validated from "./validated";

export default () => {
  const young = useSelector((state) => state.Auth.young) || {};

  const renderStep = () => {
    // screens that doesn't depend on the cohort of the young
    if (young.status === YOUNG_STATUS.WITHDRAWN) return <Withdrawn />;
    if (young.status === YOUNG_STATUS.WAITING_LIST) return <WaitingList />;
    if (young.status === YOUNG_STATUS.REFUSED) return <Refused />;
    if (["2022", "Juillet 2022", "Juin 2022", "Février 2022"].includes(young.cohort)) {
      // they are in the new cohort, we display the inscription step
      if (young.status === YOUNG_STATUS.WAITING_CORRECTION) return <WaitingCorrection />;
      if (young.status === YOUNG_STATUS.WAITING_VALIDATION) return <WaitingValidation />;
      if (young.status === YOUNG_STATUS.VALIDATED) return <Validated />;
    }
    return <Default />;
  };

  return renderStep();
};
