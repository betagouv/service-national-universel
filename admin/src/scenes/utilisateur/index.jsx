import React from "react";
import { Redirect, Switch } from "react-router-dom";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { SentryRoute } from "../../sentry";

import Edit from "./edit";
import List from "./list";

export default function User() {
  useDocumentTitle("Utilisateurs");

  return (
    <Switch>
      <SentryRoute
        path="/user/:id"
        render={({ match }) => {
          const { id } = match.params;
          if (!/^[0-9a-fA-F]{24}$/.test(id)) {
            return <Redirect to="/user" />;
          }
          return <SentryRoute component={Edit} />;
        }}
      />
      <SentryRoute path="/user" component={List} />
    </Switch>
  );
}
