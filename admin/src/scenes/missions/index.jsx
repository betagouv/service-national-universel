import React from "react";
import { Redirect, Switch } from "react-router-dom";
import { SentryRoute } from "../../sentry";
import useDocumentTitle from "../../hooks/useDocumentTitle";

import List from "./list";
import View from "./view";
import Create from "./create";

export default function Index() {
  useDocumentTitle("Missions");

  return (
    <Switch>
      <SentryRoute path="/mission/create/:id" component={Create} />
      <SentryRoute
        path="/mission/:id"
        render={({ match }) => {
          const { id } = match.params;
          if (!/^[0-9a-fA-F]{24}$/.test(id)) {
            return <Redirect to="/mission" />;
          }
          return <SentryRoute component={View} />;
        }}
      />
      <SentryRoute path="/mission" component={List} />
    </Switch>
  );
}
