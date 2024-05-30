import React from "react";
import { Switch } from "react-router-dom";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { SentryRoute } from "../../sentry";

import Create from "./create";
import List from "./list";
import View from "./view";
import { toastr } from "react-redux-toastr";
import NotFound from "@/components/layout/NotFound";

export default function Index() {
  useDocumentTitle("Classes");

  return (
    <Switch>
      <SentryRoute path="/classes/create" component={Create} />
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
      <SentryRoute path="/classes" component={List} />
    </Switch>
  );
}
