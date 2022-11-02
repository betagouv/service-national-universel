import React from "react";
import { Switch } from "react-router-dom";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { SentryRoute } from "../../sentry";

import List from "./List";
import Region from "./Region";

export default function Index() {
  useDocumentTitle("Table de repartition");

  return (
    <Switch>
      <SentryRoute path="/table-de-repartition/:region/:cohort" component={Region} />
      <SentryRoute path="/table-de-repartition" component={List} />
    </Switch>
  );
}
