import React from "react";
import { Switch } from "react-router-dom";
import { SentryRoute } from "@/sentry";
import NoMatchingDate from "./scenes/NoMatchingDate";
import ChangeSejourMenu from "./scenes/ChangeSejourMenu";
import PrevenirSejour from "./scenes/PrevenirSejour";
import WithdrawSejour from "./scenes/WithdrawSejour";
import NewChoiceSejour from "./scenes/NewChoiceSejour";

const ChangeSejour = () => {
  return (
    <Switch>
      <SentryRoute path="/changer-de-sejour/motif" component={NewChoiceSejour} />
      <SentryRoute path="/changer-de-sejour/se-desister" component={WithdrawSejour} />
      <SentryRoute path="/changer-de-sejour/prevenir-sejour" component={PrevenirSejour} />
      <SentryRoute path="/changer-de-sejour/no-date" component={NoMatchingDate} />
      <SentryRoute path="/changer-de-sejour/" component={ChangeSejourMenu} />
    </Switch>
  );
};

export default ChangeSejour;
