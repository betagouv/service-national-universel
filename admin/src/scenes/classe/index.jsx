import React from "react";
import { Switch } from "react-router-dom";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { SentryRoute } from "../../sentry";

import Create from "./create";
import List from "./list";
import View from "./view";

export default function Index() {
  useDocumentTitle("Mes classes");

  return (
    <Switch>
      <SentryRoute path="/mes-classes/create" component={Create} />
      <SentryRoute path="/mes-classes/:id" component={View} />
      <SentryRoute path="/mes-classes" component={List} />
    </Switch>
  );
}
