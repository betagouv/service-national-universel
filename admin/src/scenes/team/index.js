import React from "react";
import { Switch, Route } from "react-router-dom";

import List from "./list";
import Invite from "./invite";

export default () => {
  return (
    <Switch>
      <Route path="/team/invite" component={Invite} />
      <Route path="/team" component={List} />
    </Switch>
  );
};
