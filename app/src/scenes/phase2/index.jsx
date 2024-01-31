import React from "react";
import { useSelector } from "react-redux";
import { Switch, useHistory } from "react-router-dom";
import { permissionPhase2, YOUNG_STATUS_PHASE2 } from "../../utils";
import Mig from "./Mig";
import Home from "./home";
import EditEquivalence from "./views/EditEquivalence";
import ValidatedDesktop from "./desktop/Validated";
import ValidatedMobile from "./mobile/Validated";
import { SentryRoute } from "../../sentry";
import useDocumentTitle from "../../hooks/useDocumentTitle";

export default function Index() {
  useDocumentTitle("Phase 2 - MIG");

  const young = useSelector((state) => state.Auth.young);
  const history = useHistory();

  if (!young || !permissionPhase2(young)) history.push("/");

  if (young.statusPhase2 === YOUNG_STATUS_PHASE2.VALIDATED)
    return (
      <>
        <div className="hidden flex-1 md:flex">
          <ValidatedDesktop />
        </div>
        <div className="flex md:hidden ">
          <ValidatedMobile />
        </div>
      </>
    );

  return (
    <Switch>
      <SentryRoute path="/phase2/equivalence/:equivalenceId" component={EditEquivalence} />
      <SentryRoute path="/phase2/equivalence" component={EditEquivalence} />
      <SentryRoute path="/phase2/mig" component={Mig} />
      <SentryRoute path="/phase2" component={Home} />
    </Switch>
  );
}
