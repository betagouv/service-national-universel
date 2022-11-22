import React from "react";
import { Switch } from "react-router-dom";
import { SentryRoute } from "../../../../sentry";

import Phase2Application from "./application";
import View from "./view";
import History from "./history";

export default function Index({ young, getYoung }) {
  if (!young) return <div />;
  return (
    <>
      <Switch>
        <SentryRoute path="/volontaire/:id/phase2/application/:applicationId/historique" component={() => <History young={young} onChange={getYoung} />} />
        <SentryRoute path="/volontaire/:id/phase2/application/:applicationId" component={() => <Phase2Application young={young} onChange={getYoung} />} />
        <SentryRoute path="/volontaire/:id/phase2" component={() => <View young={young} onChange={getYoung} />} />
      </Switch>
    </>
  );
}
