import React from "react";
import { Switch, Route } from "react-router-dom";

import Details from "./view/details";
import Missions from "./view/missions";
import Historic from "./view/historic";
import Edit from "./edit";
import List from "./list";

export default () => {
  return (
    <Switch>
      <Route path="/structure/create" component={Edit} />
      <Route path="/structure/:id/edit" component={Edit} />
      <Route path="/structure/:id/missions" component={Missions} />
      <Route path="/structure/:id/historic" component={Historic} />
      <Route path="/structure/:id" component={Details} />
      <Route path="/structure" component={List} />
    </Switch>
  );
};
