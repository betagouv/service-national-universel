import React from "react";
import { Redirect, Switch } from "react-router-dom";
import { SentryRoute } from "../../sentry";

import List from "./list";
import View from "./view";
import Create from "./create";

export default function Ticket() {
  return (
    <Switch>
      <SentryRoute path="/ticket/new" component={Create} />
      <SentryRoute
        path="/ticket/:id"
        render={({ match }) => {
          const { id } = match.params;
          if (!/^[0-9a-fA-F]{24}$/.test(id)) {
            return <Redirect to="/ticket" />;
          }
          return <SentryRoute component={View} />;
        }}
      />
      <SentryRoute path="/ticket" component={List} exact />
    </Switch>
  );
}
