import React from "react";
import { Switch } from "react-router-dom";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { SentryRoute } from "../../sentry";

import General from "./general";
import Inscription from "./inscription";
import Sejour from "./sejour";
import Engagement from "./engagement";

export default function Index() {
  useDocumentTitle("Tableau de bord");

  return (
    <Switch>
      <SentryRoute path="/dashboard/inscription" component={Inscription} />
      <SentryRoute path="/dashboard/sejour" component={Sejour} />
      <SentryRoute path="/dashboard/engagement" component={Engagement} />
      <SentryRoute path="/dashboard" component={General} />
    </Switch>
  );
}
