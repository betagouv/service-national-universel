import React from "react";
import { useSelector } from "react-redux";

import Validated from "./validated";
import WaitingValidation from "./waitingValidation";
import WaitingRealisation from "./waitingRealisation";
import { YOUNG_STATUS_PHASE3 } from "../../../utils";

export default () => {
  const young = useSelector((state) => state.Auth.young) || {};

  const renderStep = () => {
    if (young.statusPhase3 === YOUNG_STATUS_PHASE3.WAITING_VALIDATION) return <WaitingValidation />;
    if (young.statusPhase3 === YOUNG_STATUS_PHASE3.VALIDATED) return <Validated />;
    return <WaitingRealisation />;
  };

  return renderStep();
};
