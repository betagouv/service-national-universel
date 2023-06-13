import React from "react";
import { Switch } from "react-router-dom";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { SentryRoute } from "../../sentry";

import List from "./list";

export default function Team() {
  useDocumentTitle("Mon équipe");

  return (
    <Switch>
      <SentryRoute path="/equipe" component={List} />
    </Switch>
  );
}
