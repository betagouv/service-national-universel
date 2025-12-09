import React from "react";
import { Switch } from "react-router-dom";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { SentryRoute } from "../../sentry";

import List from "./list";
import View from "./view";
import Youngs from "./youngs";
import Team from "./view/Team.tsx";
import ListPresence from "./ListPresence";
import NotFound from "@/components/layout/NotFound";

export default function Index() {
  useDocumentTitle("Centres");

  return (
    <Switch>
      <SentryRoute path="/centre/nouveau" component={() => <NotFound />} />
      <SentryRoute path="/centre/import" component={() => <NotFound />} />
      <SentryRoute path="/centre/:id/:sessionId/equipe" component={Team} />
      <SentryRoute path="/centre/:id/:sessionId/:currentTab" component={Youngs} />
      <SentryRoute path="/centre/liste/presence" component={ListPresence} />
      <SentryRoute path="/centre/liste/:currentTab" component={List} />
      <SentryRoute exact path="/centre" component={List} />
      <SentryRoute path="/centre/:id" component={View} />
    </Switch>
  );
}
