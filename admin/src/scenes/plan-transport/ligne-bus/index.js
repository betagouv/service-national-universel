import React from "react";
import { Switch } from "react-router-dom";
import useDocumentTitle from "../../../hooks/useDocumentTitle";
import { SentryRoute } from "../../../sentry";
import Historic from "./Historic";
import List from "./List";
import ListeDemandeModif from "./ListeDemandeModif";
import View from "./View/View";
import Import from "./import";
import ListBus from "./ListBus";
import ListPDR from "./ListPDR";

export default function Index() {
  useDocumentTitle("Plan de transport");
  return (
    <Switch>
      <SentryRoute path="/ligne-de-bus/historique" component={Historic} />
      <SentryRoute path="/ligne-de-bus/demande-de-modification" component={ListeDemandeModif} />
      <SentryRoute path="/ligne-de-bus/import" component={Import} />
      <SentryRoute path="/ligne-de-bus/volontaires/bus/:id" component={ListBus} />
      <SentryRoute path="/ligne-de-bus/volontaires/point-de-rassemblement/:id" component={ListPDR} />
      <SentryRoute path="/ligne-de-bus/:id" component={View} />
      <SentryRoute path="/ligne-de-bus" component={List} />
    </Switch>
  );
}
