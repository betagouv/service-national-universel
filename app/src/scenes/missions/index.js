import React from "react";
import { Switch, Route, useHistory } from "react-router-dom";
import { useSelector } from "react-redux";

import List from "./list";
import ViewDesktop from "./viewDesktop";
import ViewMobile from "./viewMobile";
import { permissionPhase2 } from "../../utils";

export default function Index() {
  const young = useSelector((state) => state.Auth.young);
  const history = useHistory();
  if (!young || !permissionPhase2(young)) history.push("/");

  const getMissionView = () => {
    return (
      <>
        <div className="hidden md:flex flex-1">
          <ViewDesktop />
        </div>
        <div className="flex md:hidden ">
          <ViewMobile />
        </div>
      </>
    );
  };

  return (
    <Switch>
      <Route path="/mission/:id" component={getMissionView} />
      <Route path="/mission" component={List} />
    </Switch>
  );
}
