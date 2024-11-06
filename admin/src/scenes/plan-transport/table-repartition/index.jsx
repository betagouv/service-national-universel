import React from "react";
import { Switch } from "react-router-dom";
import { SentryRoute } from "../../../sentry";
import NationalView from "./NationalView";
import RegionalView from "./RegionalView";

export default function TableRepartition() {
  return (
    <Switch>
      <SentryRoute path="/table-repartition/regional" component={RegionalView} />
      <SentryRoute path="/table-repartition" component={NationalView} />
    </Switch>
  );
}
