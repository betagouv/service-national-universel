import React from "react";
import { Redirect, Switch } from "react-router-dom";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { SentryRoute } from "../../sentry";

import View from "./view";
import List from "./List";

export default function Index() {
  useDocumentTitle("Mon établissement");

  return (
    <Switch>
      <SentryRoute
        path="/etablissement/:id"
        render={({ match }) => {
          const { id } = match.params;
          if (!/^[0-9a-fA-F]{24}$/.test(id)) {
            return <Redirect to="/etablissement" />;
          }
          return <SentryRoute component={View} />;
        }}
      />
      <SentryRoute path="/etablissement" component={List} />
      <SentryRoute path="/mon-etablissement" component={View} />
    </Switch>
  );
}
