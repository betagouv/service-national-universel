import React from "react";
import { Switch } from "react-router-dom";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { SentryRoute } from "../../sentry";

import Edit from "./Edit";
import List from "./List";
import Create from "./Create";
import CreateTransport from "./CreateTransport";
import History from "./history";

export default function Index() {
  useDocumentTitle("Points de rassemblement");

  return (
    <Switch>
      <SentryRoute path="/point-de-rassemblement/nouveau" component={Create} />
      <SentryRoute path="/point-de-rassemblement/nouveau-transport" component={CreateTransport} />
      <SentryRoute path="/point-de-rassemblement/:id/historique" component={History} />
      <SentryRoute path="/point-de-rassemblement/:id" component={Edit} />
      <SentryRoute path="/point-de-rassemblement" component={List} />
    </Switch>
  );
}
