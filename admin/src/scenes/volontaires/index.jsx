import React from "react";
import { Redirect, Switch } from "react-router-dom";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { SentryRoute } from "../../sentry";

import List from "./list";
import View from "./view";
import Create from "./create";

export default function Index() {
  useDocumentTitle("Volontaires");

  return (
    <Switch>
      <SentryRoute path="/volontaire/create" component={Create} />
      <SentryRoute
        path="/volontaire/:id"
        render={({ match }) => {
          const { id } = match.params;
          if (!/^[0-9a-fA-F]{24}$/.test(id)) {
            return <Redirect to="/volontaire" />;
          }
          return <SentryRoute component={View} />;
        }}
      />
      <SentryRoute path="/volontaire" component={List} />
    </Switch>
  );
}
