import React from "react";
import { Switch } from "react-router-dom";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { SentryRoute } from "../../sentry";
import List from "./List";

export default function Index() {
  useDocumentTitle("Points de rassemblement");

  return (
    <Switch>
      {/* <SentryRoute path="/point-de-rassemblement/nouveau" component={Create} /> */}
      <SentryRoute path="/point-de-rassemblement" component={List} />
    </Switch>
  );
}
