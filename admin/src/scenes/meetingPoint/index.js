import React from "react";
import { Switch, Route } from "react-router-dom";
import useDocumentTitle from "../../hooks/useDocumentTitle";

import Edit from "./Edit";
import List from "./List";
import History from "./history";

export default function Index() {
  useDocumentTitle("Points de rassemblement");

  return (
    <Switch>
      <Route path="/point-de-rassemblement/:id/historique" component={History} />
      <Route path="/point-de-rassemblement/:id" component={Edit} />
      <Route path="/point-de-rassemblement" component={List} />
    </Switch>
  );
}
