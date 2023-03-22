import React from "react";
import { Switch } from "react-router-dom";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { SentryRoute } from "../../sentry";
import Create from "./Create";
import List from "./List";
import View from "./View";

export default function Index() {
  useDocumentTitle("Points de rassemblement");

  return (
    <Switch>
      <SentryRoute path="/point-de-rassemblement/nouveau" component={Create} />
      <SentryRoute path="/point-de-rassemblement/liste/:currentTab" component={List} />
      <SentryRoute path="/point-de-rassemblement/:id" component={View} />
    </Switch>
  );
}
