import React from "react";
import { Redirect, Switch } from "react-router-dom";
import { SentryRoute } from "@/sentry";
import WithdrawSejour from "./scenes/WithdrawSejour";

// GOO-65 (lot P23) : le changement de séjour est décommissionné ; seul le désistement reste servi.
const ChangeSejour = () => {
  return (
    <Switch>
      <SentryRoute path="/changer-de-sejour/se-desister" component={WithdrawSejour} />
      <Redirect to="/" />
    </Switch>
  );
};

export default ChangeSejour;
