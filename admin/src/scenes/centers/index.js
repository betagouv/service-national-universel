import React from "react";
import { Switch } from "react-router-dom";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { SentryRoute } from "../../sentry";

import List from "./list";
import Edit from "./edit";
import View from "./view";
import Youngs from "./youngs";
import Team from "./view/team";

export default function CenterIndex() {
  useDocumentTitle("Centres");

  return (
    <Switch>
      <SentryRoute path="/centre/nouveau" component={Edit} />
      <SentryRoute path="/centre/:id/edit" component={Edit} />
      <SentryRoute path="/centre/:id/:sessionId/equipe" component={Team} />
      <SentryRoute path="/centre/:id/:sessionId/:currentTab" component={Youngs} />
      <SentryRoute path="/centre/:id" component={View} />
      <SentryRoute path="/centre" component={List} />
    </Switch>
  );
}
