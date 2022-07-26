import React from "react";
import { Switch } from "react-router-dom";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { SentryRoute } from "../../sentry";

import Edit from "./edit";
import List from "./list";
import View from "./view";
import Create from "./create";

export default function Index() {
  useDocumentTitle("Volontaires");

  return (
    <Switch>
      <SentryRoute path="/volontaire/create" component={Create} />
      <SentryRoute path="/volontaire/:id/edit" component={Edit} />
      <SentryRoute path="/volontaire/:id" component={View} />
      <SentryRoute path="/volontaire" component={List} />
    </Switch>
  );
}
