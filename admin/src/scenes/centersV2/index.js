import React from "react";
import { Switch } from "react-router-dom";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { SentryRoute } from "../../sentry";
import Create from "./Create";

import List from "./list";
import View from "./view";
import Youngs from "./youngs";
import Team from "./view/team";
import ListPresence from "./ListPresence";

export default function Index() {
  useDocumentTitle("Centres");

  return (
    <Switch>
      <SentryRoute path="/centre/nouveau" component={Create} />
      <SentryRoute path="/centre/:id/:sessionId/equipe" component={Team} />
      <SentryRoute path="/centre/:id/:sessionId/:currentTab" component={Youngs} />
      <SentryRoute path="/centre/liste/presence" component={ListPresence} />
      <SentryRoute path="/centre/liste/:currentTab" component={List} />
      <SentryRoute exact path="/centre" component={List} />
      <SentryRoute path="/centre/:id" component={View} />
    </Switch>
  );
}
