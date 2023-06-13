import React from "react";
import { Switch } from "react-router-dom";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { SentryRoute } from "../../sentry";

import Dashboard from "./dashboard";
import Ticket from "./ticket";

export default function SupportCenter() {
  useDocumentTitle("Support");
  const fromPage = decodeURIComponent(window.location.search).split("?from=")[1];

  return (
    <Switch>
      <SentryRoute path="/besoin-d-aide/ticket" component={Ticket} fromPage={fromPage} />
      <SentryRoute path="/besoin-d-aide" component={Dashboard} />
    </Switch>
  );
}
