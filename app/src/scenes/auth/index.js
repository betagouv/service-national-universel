import React from "react";
import { Route, Switch } from "react-router-dom";

import Reset from "./reset";
import Forgot from "./forgot";
import Singin from "./signin";
import Signup from "./signup";
import Connect from "./connect";

export default () => {
  return (
    <Switch>
      <Route path="/auth/reset" component={Reset} />
      <Route path="/auth/forgot" component={Forgot} />
      <Route path="/auth/signup" component={Signup} />
      <Route path="/auth/connect" component={Connect} />
      <Route path="/auth" component={Singin} />
    </Switch>
  );
};
