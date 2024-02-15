import React from "react";
import { Switch } from "react-router-dom";

import Home from "./home";
import Missions from "./missions";
import Valider from "./valider";
import { SentryRoute } from "../../sentry";
import useDocumentTitle from "../../hooks/useDocumentTitle";

export default function Index() {
  useDocumentTitle("Phase 3 - Engagement");

  return (
    <div>
      <Switch>
        <SentryRoute path="/phase3/valider" component={Valider} />
        <SentryRoute path="/phase3/mission" component={Missions} />
        <SentryRoute path="/phase3" component={Home} />
      </Switch>
    </div>
  );
}
