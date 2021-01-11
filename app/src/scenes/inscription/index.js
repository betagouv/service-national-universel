import React, { useEffect, useState } from "react";
import { Route, Switch } from "react-router-dom";

import Home from "./Home/index.js";
import Steps from "./Create/index.js";

export default () => {
  return (
    <Switch>
      <Route path="/inscription/create" component={Steps} />
      <Route path="/inscription" component={Home} />
    </Switch>
  );
};
