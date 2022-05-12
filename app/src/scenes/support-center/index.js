import React from "react";
import { Switch, Route, Redirect } from "react-router-dom";
import { useSelector } from "react-redux";

import Dashboard from "./dashboard";
import Ticket from "./ticket";

export default function Index() {
  const young = useSelector((state) => state.Auth.young);
  const fromPage = decodeURIComponent(window.location.search).split("?from=")[1];
  if (!young) {
    const redirect = encodeURIComponent(window.location.href.replace(window.location.origin, "").substring(1));
    return <Redirect to={{ search: redirect && redirect !== "logout" ? `?redirect=${redirect}` : "", pathname: "/inscription" }} />;
  }

  return (
    <Switch>
      <Route path="/besoin-d-aide/ticket" component={Ticket} fromPage={fromPage} />
      <Route path="/besoin-d-aide" component={Dashboard} />
    </Switch>
  );
}
