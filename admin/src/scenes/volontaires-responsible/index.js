import React from "react";
import { Switch } from "react-router-dom";
import { environment } from "../../config";
import { SentryRoute } from "../../sentry";

import ListV2 from "./listV2";
import List from "./list";
import View from "./view";

export default function Index() {
  return (
    <Switch>
      {environment === "production" ? (
        <>
          <SentryRoute path="/volontaire/:id" component={View} />
          <SentryRoute path="/volontaire" component={List} />
        </>
      ) : (
        <>
          <SentryRoute path="/volontaire/list/:currentTab" component={ListV2} />
          <SentryRoute path="/volontaire/:id/phase2/application/:applicationId" component={View} />
        </>
      )}
    </Switch>
  );
}
