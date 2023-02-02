import React from "react";
import { Switch } from "react-router-dom";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { SentryRoute } from "../../sentry";

import View from "./view";
import Edit from "./edit";
import List from "./list";
import ListV2 from "./listV2";
import Create from "./create";
import { environment } from "../../config";

export default function Index() {
  useDocumentTitle("Structures");

  return (
    <Switch>
      <SentryRoute path="/structure/create" component={Create} />
      <SentryRoute path="/structure/:id/edit" component={environment === "production" ? Edit : View} />
      <SentryRoute path="/structure/:id" component={View} />
      <SentryRoute path="/structure" component={environment === "production" ? List : ListV2} />
    </Switch>
  );
}
