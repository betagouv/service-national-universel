import React from "react";
import { useSelector } from "react-redux";
import { Switch, useHistory } from "react-router-dom";
import { permissionPhase2, YOUNG_STATUS_PHASE2 } from "../../utils";
import View from "./view";
import CreateEquivalence from "./views/CreateEquivalence";
import EditEquivalence from "./views/EditEquivalence";
import ValidatedDesktop from "./desktop/Validated";
import ValidatedMobile from "./mobile/Validated";
import { SentryRoute } from "../../sentry";

export default function Index() {
  const young = useSelector((state) => state.Auth.young);
  const history = useHistory();

  if (!young || !permissionPhase2(young)) history.push("/");

  if (young.statusPhase2 === YOUNG_STATUS_PHASE2.VALIDATED)
    return (
      <>
        <div className="hidden md:flex flex-1">
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
      <SentryRoute path="/phase2/equivalence" component={CreateEquivalence} />
      <SentryRoute path="/phase2" component={View} />
    </Switch>
  );
}
