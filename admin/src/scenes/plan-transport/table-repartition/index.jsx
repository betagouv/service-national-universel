import React from "react";
import { Switch } from "react-router-dom";
import { SentryRoute } from "../../../sentry";
import National from "./National";
import Regional from "./Regional";

export default function TableRepartition() {
  return (
    <Switch>
      <SentryRoute path="/table-repartition/regional" component={Regional} />
      <SentryRoute path="/table-repartition" component={National} />
    </Switch>
  );
}
