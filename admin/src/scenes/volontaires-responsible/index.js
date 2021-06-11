import React, { useEffect, useState } from "react";
import { Switch, Route } from "react-router-dom";

import List from "./list";
import View from "./view";

export default ({ ...props }) => {
  return (
    <Switch>
      <Route path="/volontaire/:id" component={View} />
      <Route path="/volontaire" component={List} />
    </Switch>
  );
};
