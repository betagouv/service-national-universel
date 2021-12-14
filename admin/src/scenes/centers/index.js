import React from "react";
import { Switch, Route, useHistory } from "react-router-dom";
import { useSelector } from "react-redux";

import List from "./list";
import Edit from "./edit";
import View from "./view";

export default function CenterIndex() {
  const user = useSelector((state) => state.Auth.user);
  const history = useHistory();
  if (user?.role !== "admin") {
    history.push("/");
    return null;
  }

  return (
    <Switch>
      <Route path="/centre/create" component={Edit} />
      <Route path="/centre/:id/edit" component={Edit} />
      <Route path="/centre/:id" component={View} />
      <Route path="/centre" component={List} />
    </Switch>
  );
}
