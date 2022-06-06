import React from "react";
import { Switch, Route } from "react-router-dom";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { environment } from "../../config";

import Edit from "./Edit";
import List from "./List";
import Create from "./Create";
import CreateTransport from "./CreateTransport";
import History from "./history";

export default function Index() {
  useDocumentTitle("Points de rassemblement");

  return (
    <Switch>
      {environment !== "production" ? <Route path="/point-de-rassemblement/nouveau" component={Create} /> : null}
      {environment !== "production" ? <Route path="/point-de-rassemblement/nouveau-transport" component={CreateTransport} /> : null}
      <Route path="/point-de-rassemblement/:id/historique" component={History} />
      <Route path="/point-de-rassemblement/:id" component={Edit} />
      <Route path="/point-de-rassemblement" component={List} />
    </Switch>
  );
}
