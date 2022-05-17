import React from "react";
import { Switch, Route } from "react-router-dom";
import useDocumentTitle from "../../hooks/useDocumentTitle";

import List from "./list";

export default function MeetingPoint() {
  useDocumentTitle("Points de rassemblement");

  return (
    <Switch>
      {/* <Route path="/point-de-rassemblement/nouveau" component={Edit} />
      <Route path="/point-de-rassemblement/:id/edit" component={Edit} />
      <Route path="/point-de-rassemblement/:id/:sessionId/equipe" component={Team} />
      <Route path="/point-de-rassemblement/:id/:sessionId/:currentTab" component={Youngs} />
      <Route path="/point-de-rassemblement/:id" component={View} /> */}
      <Route path="/point-de-rassemblement" component={List} />
    </Switch>
  );
}
