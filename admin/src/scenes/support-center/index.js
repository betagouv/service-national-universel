import React from "react";
import { Switch, Route } from "react-router-dom";
import useDocumentTitle from "../../hooks/useDocumentTitle";

import Dashboard from "./dashboard";
import Ticket from "./ticket";

export default function SupportCenter() {
  useDocumentTitle("Support");
  const fromPage = decodeURIComponent(window.location.search).split("?from=")[1];

  return (
    <Switch>
      <Route path="/besoin-d-aide/ticket" component={Ticket} fromPage={fromPage} />
      <Route path="/besoin-d-aide" component={Dashboard} />
    </Switch>
  );
}
