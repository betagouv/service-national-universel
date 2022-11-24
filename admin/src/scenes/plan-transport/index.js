import React from "react";
import { Switch } from "react-router-dom";
import { SentryRoute } from "../../sentry";
import Home from "./Home";
import TableRepartition from "./table-repartition";
import SchemaRepartition from "./schema-repartition";

export default function PlanTransport() {
  return (
    <Switch>
      <SentryRoute path="/plan-de-transport/table-repartition" component={TableRepartition} />
      <SentryRoute path="/plan-de-transport/schema-repartition/:region/:department" component={SchemaRepartition} />
      <SentryRoute path="/plan-de-transport/schema-repartition/:region" component={SchemaRepartition} />
      <SentryRoute path="/plan-de-transport/schema-repartition" component={SchemaRepartition} />
      <SentryRoute path="/plan-de-transport" component={Home} />
    </Switch>
  );
}
