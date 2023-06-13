import React from "react";
import { Switch } from "react-router-dom";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { SentryRoute } from "../../sentry";

import List from "./list";

export default function Index() {
  useDocumentTitle("Associations");

  return (
    <Switch>
      <SentryRoute path="/association" component={List} />
    </Switch>
  );
}
