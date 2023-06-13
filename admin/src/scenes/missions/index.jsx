import React from "react";
import { Switch } from "react-router-dom";
import { SentryRoute } from "../../sentry";
import useDocumentTitle from "../../hooks/useDocumentTitle";

import List from "./list";
import Edit from "./edit";
import View from "./view";

export default function Index() {
  useDocumentTitle("Missions");

  return (
    <Switch>
      <SentryRoute path="/mission/create/:structureId" component={Edit} />
      <SentryRoute path="/mission/create" component={Edit} />
      <SentryRoute path="/mission/:id" component={View} />
      <SentryRoute path="/mission" component={List} />
    </Switch>
  );
}
