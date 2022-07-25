import React from "react";
import { Switch } from "react-router-dom";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { SentryRoute } from "../../sentry";

import Edit from "./edit";
import List from "./list";

export default function User() {
  useDocumentTitle("Utilisateurs");

  return (
    <Switch>
      <SentryRoute path="/user/:id" component={Edit} />
      <SentryRoute path="/user" component={List} />
    </Switch>
  );
}
