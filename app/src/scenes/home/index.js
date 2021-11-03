import React, { useEffect } from "react";
import { useSelector } from "react-redux";

import { YOUNG_STATUS } from "../../utils";
import WaitingValidation from "./waitingValidation";
import WaitingCorrection from "./waitingCorrection";
import Refused from "./refused";
import Default from "./default";
import Withdrawn from "./withdrawn";
import WaitingList from "./waitingList";

export default () => {
  const young = useSelector((state) => state.Auth.young) || {};

  useEffect(() => {
    console.log("STATUS", young.status);
    console.log("STATUS", young);
  }, []);

  const renderStep = () => {
    if (young.status === YOUNG_STATUS.WITHDRAWN) return <Withdrawn />;
    if (young.status === YOUNG_STATUS.WAITING_CORRECTION) return <WaitingCorrection />;
    if (young.status === YOUNG_STATUS.WAITING_VALIDATION) return <WaitingValidation />;
    if (young.status === YOUNG_STATUS.WAITING_LIST) return <WaitingList />;
    if (young.status === YOUNG_STATUS.REFUSED) return <Refused />;
    return <Default />;
  };

  return renderStep();
};
