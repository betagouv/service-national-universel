import React from "react";
import { Switch } from "react-router-dom";
import { SentryRoute } from "../../sentry";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import List from "./list";
import Deplacement from "./deplacement";

export default function Index() {
  useDocumentTitle("Edit Plan de transport");
  return (
    <Switch>
      <SentryRoute exact path="/edit-transport" component={List} />
      <SentryRoute path="/edit-transport/deplacement" component={Deplacement} />
    </Switch>
  );
}
