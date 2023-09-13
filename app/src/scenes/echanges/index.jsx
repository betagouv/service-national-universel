import React from "react";
import { SentryRoute } from "@/sentry";
import { Switch } from "react-router-dom";
import View from "./View";
import List from "./List";
import useDocumentTitle from "@/hooks/useDocumentTitle";

export default function Echanges() {
  useDocumentTitle("Echanges");
  return (
    <Switch>
      <SentryRoute path="/echanges/:id" component={View} />
      <SentryRoute path="/echanges" component={List} />
    </Switch>
  );
}
