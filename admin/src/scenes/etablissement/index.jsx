import React from "react";
import { Switch } from "react-router-dom";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { SentryRoute } from "../../sentry";

import View from "./view";
import List from "./List";
import Create from "./Create/Create";
import NotFound from "@/components/layout/NotFound";
import { toastr } from "react-redux-toastr";

export default function Index() {
  useDocumentTitle("Mon établissement");

  return (
    <Switch>
      <SentryRoute path="/etablissement/create" component={Create} />
      <SentryRoute
        path="/etablissement/:id"
        render={({ match }) => {
          const { id } = match.params;
          if (!/^[0-9a-fA-F]{24}$/.test(id)) {
            toastr.error("Identifiant invalide : " + id);
            return <SentryRoute component={NotFound} />;
          }
          return <SentryRoute component={View} />;
        }}
      />
      <SentryRoute path="/etablissement" component={List} />
      <SentryRoute path="/mon-etablissement" component={View} />
    </Switch>
  );
}
