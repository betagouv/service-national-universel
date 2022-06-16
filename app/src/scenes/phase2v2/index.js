import React from "react";
import { useSelector } from "react-redux";
import { Route, Switch, useHistory } from "react-router-dom";
import { permissionPhase2 } from "../../utils";
import View from "./view";
import CreateEquivalence from "./views/CreateEquivalence";
import EditEquivalence from "./views/EditEquivalence";

export default function Index() {
  const young = useSelector((state) => state.Auth.young);
  const history = useHistory();

  if (!young || !permissionPhase2(young)) history.push("/");

  return (
    <Switch>
      <Route path="/phase2/equivalence/:equivalenceId" component={EditEquivalence} />
      <Route path="/phase2/equivalence" component={CreateEquivalence} />
      <Route path="/phase2" component={View} />
    </Switch>
  );
}
