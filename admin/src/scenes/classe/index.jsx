import React from "react";
import { Switch } from "react-router-dom";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { SentryRoute } from "../../sentry";

import View from "./view";
import Create from "./create";

export default function Index() {
  useDocumentTitle("Mes classes");

  return (
    <Switch>
      <SentryRoute path="/mes-classes" component={View} />
      <SentryRoute path="/creer-une-classe" component={Create} />
    </Switch>
  );
}
