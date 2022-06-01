import React from "react";
import { useSelector } from "react-redux";
import { Route, Switch, useHistory } from "react-router-dom";
import { permissionPhase2 } from "../../utils";
import View from "./view";
import Equivalence from "./views/Equivalence";

export default function Index() {
  const young = useSelector((state) => state.Auth.young);
  const history = useHistory();

  if (!young || !permissionPhase2(young)) history.push("/");

  return (
    <Switch>
      <Route path="/phase2/equivalence" component={Equivalence} />
      <Route path="/phase2" component={View} />
    </Switch>
  );
}
