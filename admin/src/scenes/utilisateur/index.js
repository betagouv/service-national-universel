import React from "react";
import { Switch } from "react-router-dom";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { SentryRoute } from "../../sentry";
import { environment } from "../../config";

import Edit from "./edit";
import OldEdit from "./oldEdit";
import List from "./list";

export default function User() {
  useDocumentTitle("Utilisateurs");

  return (
    <Switch>
      {environment !== "production" && <SentryRoute path="/user/:id" component={Edit} />}
      {environment === "production" && <SentryRoute path="/user/:id" component={OldEdit} />}
      <SentryRoute path="/user" component={List} />
    </Switch>
  );
}
