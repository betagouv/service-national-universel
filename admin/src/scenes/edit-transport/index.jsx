import React from "react";
import { Switch } from "react-router-dom";
import { SentryRoute } from "../../sentry";
import List from "./List";
import useDocumentTitle from "../../hooks/useDocumentTitle";

export default function Index() {
  useDocumentTitle("Edit Plan de transport");
  return (
    <Switch>
      <SentryRoute path="/edit-transport" component={List} />
    </Switch>
  );
}
