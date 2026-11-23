import React from "react";
import { Redirect, Switch } from "react-router-dom";
import MesEngagements from "./scenes/MesEngagements";
import Home from "./scenes/Home";
import EditEquivalence from "./scenes/MonEquivalence/EditEquivalence";
import MonEquivalence from "./scenes/MonEquivalence/MonEquivalence";
import Program from "./scenes/Program";
import { SentryRoute } from "../../sentry";
import useDocumentTitle from "../../hooks/useDocumentTitle";

export default function Index() {
  useDocumentTitle("Phase 2 - MIG");

  return (
    <Switch>
      <SentryRoute path="/phase2/equivalence/:id/edit" component={EditEquivalence} />
      <SentryRoute path="/phase2/equivalence/:id" component={MonEquivalence} />
      <Redirect exact from="/phase2/equivalence" to="/phase2" />
      <SentryRoute path="/phase2/mes-engagements" component={MesEngagements} />
      <SentryRoute path="/phase2/program/:id" component={Program} />
      <SentryRoute path="/phase2" component={Home} />
    </Switch>
  );
}
