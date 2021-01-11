import React, { useState } from "react";
import { Switch, Route } from "react-router-dom";

import Edit from "./edit";
import List from "./list";

export default () => {
  return (
    <Switch>
      <Route path="/volontaire/:id" component={Edit} />
      <Route path="/volontaire" component={List} />
    </Switch>
  );
};
