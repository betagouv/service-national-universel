import React from "react";
import { Redirect, Switch } from "react-router-dom";
import { SentryRoute } from "@/sentry";
import WithdrawSejour from "./scenes/WithdrawSejour";

const ChangeSejour = () => {
  return (
    <Switch>
      <SentryRoute path="/changer-de-sejour/se-desister" component={WithdrawSejour} />
      {/* Le changement de séjour est décommissionné : les anciennes URL renvoient à l'accueil. */}
      <Redirect to="/" />
    </Switch>
  );
};

export default ChangeSejour;
