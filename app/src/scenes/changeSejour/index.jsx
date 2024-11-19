import React, { lazy, Suspense } from "react";
import { Redirect, Switch } from "react-router-dom";
import { SentryRoute } from "@/sentry";
import Loader from "@/components/Loader"; // Assurez-vous que le chemin est correct

const ChangeSejourV2 = lazy(() => import("./scenes/changeSejourV2"));
const NoMatchingDate = lazy(() => import("./scenes/NoMatchingDate"));

const ChangeSejour = () => {
  return (
    <Switch>
      <SentryRoute path="/changer-de-sejour" component={NoMatchingDate} />
      <SentryRoute path="/changer-de-sejour/no-date" component={NoMatchingDate} />
      {/* <Redirect to="/" /> */}
    </Switch>
  );
};

export default ChangeSejour;
