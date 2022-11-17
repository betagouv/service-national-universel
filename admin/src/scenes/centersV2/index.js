import React from "react";
import { Switch } from "react-router-dom";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { SentryRoute } from "../../sentry";

import List from "./list";
import Edit from "./edit";
import View from "./view";
import Youngs from "./youngs";
import Team from "./view/team";

export default function CenterV2Index() {
  useDocumentTitle("CentresV2");

  return (
    <Switch>
      <SentryRoute path="/centreV2/nouveau" component={Edit} />
      <SentryRoute path="/centreV2/:id/edit" component={Edit} />
      <SentryRoute path="/centreV2/:id/:sessionId/equipe" component={Team} />
      <SentryRoute path="/centreV2/:id/:sessionId/:currentTab" component={Youngs} />
      <SentryRoute path="/centreV2/:id" component={View} />
      <SentryRoute path="/centreV2" component={List} />
    </Switch>
  );
}
