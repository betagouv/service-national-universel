import React from "react";
import { Switch, Redirect } from "react-router-dom";
import { useSelector } from "react-redux";

import Dashboard from "./dashboard";
import Ticket from "./ticket";
import { SentryRoute } from "../../sentry";
import useDocumentTitle from "../../hooks/useDocumentTitle";

export default function Index() {
  useDocumentTitle("Besoin d'aide");
  const young = useSelector((state) => state.Auth.young);

  if (!young) {
    const redirect = encodeURIComponent(window.location.href.replace(window.location.origin, "").substring(1));
    return <Redirect to={{ search: redirect && redirect !== "logout" ? `?redirect=${redirect}` : "", pathname: "/preinscription" }} />;
  }

  return (
    <Switch>
      <SentryRoute path="/besoin-d-aide/ticket" component={Ticket} />
      <SentryRoute path="/besoin-d-aide" component={Dashboard} />
    </Switch>
  );
}
