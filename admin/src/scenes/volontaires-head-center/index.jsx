import React from "react";
import { Switch } from "react-router-dom";
import { SentryRoute } from "../../sentry";

import View from "./view";

export default function Index() {
  return (
    <Switch>
      <SentryRoute path="/volontaire/:id" component={View} />
    </Switch>
  );
}
