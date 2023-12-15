import React from "react";
import { Switch } from "react-router-dom";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { SentryRoute } from "../../sentry";

import View from "./view";
import List from "./List";

export default function Index() {
  useDocumentTitle("Mon établissement");

  return (
    <Switch>
      <SentryRoute path="/etablissement/:id" component={View} />
      <SentryRoute path="/etablissement" component={List} />
      <SentryRoute path="/mon-etablissement" component={View} />
    </Switch>
  );
}
