import React from "react";
import { Switch } from "react-router-dom";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { SentryRoute } from "../../sentry";

import Create from "./create";
import List from "./list";
import View from "./view";

export default function Index() {
  useDocumentTitle("Classes");

  return (
    <Switch>
      <SentryRoute path="/classes/create" component={Create} />
      <SentryRoute path="/classes/:id" component={View} />
      <SentryRoute path="/classes" component={List} />
    </Switch>
  );
}
