import React from "react";
import { Switch, Route } from "react-router-dom";
import { useSelector } from "react-redux";

import List from "./list";
import View from "./view";
import { permissionPhase2 } from "../../utils";

export default function Index() {
  const young = useSelector((state) => state.Auth.young);
  if (!young || !permissionPhase2(young)) history.push("/");
  return (
    <Switch>
      <Route path="/mission/:id" component={View} />
      <Route path="/mission" component={List} />
    </Switch>
  );
}
