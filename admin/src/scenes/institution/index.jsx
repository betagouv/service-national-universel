import React from "react";
import { Switch } from "react-router-dom";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { SentryRoute } from "../../sentry";

import View from "./view";

export default function Index() {
  useDocumentTitle("Mon établissement");

  return (
    <Switch>
      <SentryRoute path="/mon-etablissement" component={View} />
    </Switch>
  );
}
