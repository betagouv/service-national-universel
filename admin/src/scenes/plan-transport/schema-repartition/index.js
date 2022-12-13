import React from "react";
import { Switch } from "react-router-dom";
import { SentryRoute } from "../../../sentry";
import SchemaRepartition from "./SchemaRepartition";

export default function SchemaRepartitionIndex(props) {
  const region = props.match && props.match.params && props.match.params.region;
  const department = props.match && props.match.params && props.match.params.department;

  return (
    <Switch>
      <SentryRoute path="/schema-repartition/:region/:department" component={() => <SchemaRepartition region={region} department={department} />} />
      <SentryRoute path="/schema-repartition/:region" component={() => <SchemaRepartition region={region} />} />
      <SentryRoute path="/schema-repartition" component={() => <SchemaRepartition />} />
    </Switch>
  );
}
