import React from "react";
import { Switch } from "react-router-dom";
import { SentryRoute } from "../../sentry";

import List from "./list";
import View from "./view";

export default function Index() {
  return (
    <Switch>
      <SentryRoute path="/volontaire/:id" component={View} />
      <SentryRoute path="/volontaire" component={List} />
    </Switch>
  );
}
