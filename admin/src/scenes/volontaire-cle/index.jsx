import React from "react";
import { Switch } from "react-router-dom";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { SentryRoute } from "../../sentry";

import List from "./List";

export default function Index() {
  useDocumentTitle("Mes élèves");

  return (
    <Switch>
      <SentryRoute path="/mes-eleves" component={List} />
    </Switch>
  );
}
