import React from "react";
import { Switch, Route } from "react-router-dom";

import User from "./list";
import UserView from "./view";

export default () => {
  return (
    <Switch>
      <Route path="/admin/user/:id" component={UserView} />
      <Route path="/" component={User} />
    </Switch>
  );
};
