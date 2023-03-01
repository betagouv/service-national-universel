import React from "react";
import { Switch } from "react-router-dom";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { SentryRoute } from "../../sentry";

import View from "./view";
import ListV2 from "./listV2";
import Create from "./create";

export default function Index() {
  useDocumentTitle("Structures");

  return (
    <Switch>
      <SentryRoute path="/structure/create" component={Create} />
      <SentryRoute path="/structure/:id" component={View} />
      <SentryRoute path="/structure" component={ListV2} />
    </Switch>
  );
}
