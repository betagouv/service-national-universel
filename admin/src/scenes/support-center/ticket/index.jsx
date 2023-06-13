import React from "react";
import { Switch } from "react-router-dom";
import { SentryRoute } from "../../../sentry";

import Create from "./create";
import View from "./view";

export default function Index({ fromPage }) {
  return (
    <Switch>
      <SentryRoute path="/besoin-d-aide/ticket/:id" component={View} fromPage={fromPage} />
      <SentryRoute path="/besoin-d-aide/ticket" component={Create} fromPage={fromPage} />
    </Switch>
  );
}
