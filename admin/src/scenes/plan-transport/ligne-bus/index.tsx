import React from "react";
import { Switch } from "react-router-dom";
import useDocumentTitle from "../../../hooks/useDocumentTitle";
import { SentryRoute } from "../../../sentry";
import View from "./View/View";
import Import from "./import";
import ListBus from "./ListBus";
import ListPDR from "./ListPDR";
import Main from "./Main";

export default function Index() {
  useDocumentTitle("Plan de transport");
  return (
    <Switch>
      <SentryRoute path={["/ligne-de-bus/historique", "/ligne-de-bus/demande-de-modification", "/ligne-de-bus"]} exact component={Main} />
      <SentryRoute path="/ligne-de-bus/import" component={Import} />
      <SentryRoute path="/ligne-de-bus/volontaires/bus/:id" component={ListBus} />
      <SentryRoute path="/ligne-de-bus/volontaires/point-de-rassemblement/:id" component={ListPDR} />
      <SentryRoute path="/ligne-de-bus/:id" component={View} />
    </Switch>
  );
}
