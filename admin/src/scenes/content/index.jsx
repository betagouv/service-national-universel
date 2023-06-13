import React from "react";
import { Switch } from "react-router-dom";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { SentryRoute } from "../../sentry";

import List from "./list";
import Edit from "./edit";

export default function Index() {
  useDocumentTitle("Contenus");

  return (
    <Switch>
      <SentryRoute path="/contenu/create" component={Edit} />
      <SentryRoute path="/contenu/:id/edit" component={Edit} />
      <SentryRoute path="/contenu" component={List} />
    </Switch>
  );
}
