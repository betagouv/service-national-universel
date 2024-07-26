import React from "react";
import { useSelector } from "react-redux";
import { Switch, useHistory } from "react-router-dom";
import { permissionPhase2 } from "../../utils";
import MesEngagements from "./scenes/MesEngagements";
import Home from "./scenes/Home";
import EditEquivalence from "./scenes/MonEquivalence/EditEquivalence";
import MonEquivalence from "./scenes/MonEquivalence/MonEquivalence";
import Program from "./scenes/Program";
import { SentryRoute } from "../../sentry";
import useDocumentTitle from "../../hooks/useDocumentTitle";

export default function Index() {
  useDocumentTitle("Phase 2 - MIG");

  const young = useSelector((state) => state.Auth.young);
  const history = useHistory();

  if (!young || !permissionPhase2(young)) history.push("/");

  return (
    <Switch>
      <SentryRoute path="/phase2/equivalence/:id/edit" component={EditEquivalence} />
      <SentryRoute path="/phase2/equivalence/:id" component={MonEquivalence} />
      <SentryRoute path="/phase2/equivalence" component={EditEquivalence} />
      <SentryRoute path="/phase2/mes-engagements" component={MesEngagements} />
      <SentryRoute path="/phase2/program/:id" component={Program} />
      <SentryRoute path="/phase2" component={Home} />
    </Switch>
  );
}
