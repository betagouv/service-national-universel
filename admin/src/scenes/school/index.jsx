import React from "react";
import { Switch } from "react-router-dom";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { SentryRoute } from "../../sentry";

import List from "./List";

export default function Index() {
  useDocumentTitle("Établissements");

  return (
    <Switch>
      <SentryRoute path="/school/liste-jeunes" component={List} />
    </Switch>
  );
}
