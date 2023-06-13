import React from "react";
import { Switch } from "react-router-dom";
import { SentryRoute } from "../../sentry";

import ListV2 from "./listV2";
import View from "./view";

export default function Index() {
  return (
    <Switch>
      <SentryRoute path="/volontaire/list/:currentTab" component={ListV2} />
      <SentryRoute path="/volontaire/:id/phase2/application/:applicationId" component={View} />
    </Switch>
  );
}
