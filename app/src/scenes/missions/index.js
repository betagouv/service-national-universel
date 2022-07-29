import React, { useEffect, useState } from "react";
import { Switch, useHistory } from "react-router-dom";
import { useSelector } from "react-redux";

import List from "./list";
import ViewDesktop from "./viewDesktop";
import ViewMobile from "./viewMobile";
import { permissionPhase2 } from "../../utils";
import { SentryRoute } from "../../sentry";

export default function Index() {
  const young = useSelector((state) => state.Auth.young);
  const history = useHistory();
  if (!young || !permissionPhase2(young)) history.push("/");

  const getMissionView = () => {
    const [isDesktop, setDesktop] = useState(window.innerWidth > 768);

    function updateMedia() {
      setDesktop(window.innerWidth > 768);
    }

    useEffect(() => {
      window.addEventListener("resize", updateMedia);
      return () => window.removeEventListener("resize", updateMedia);
    });

    return <>{isDesktop ? <ViewDesktop /> : <ViewMobile />}</>;
  };

  return (
    <Switch>
      <SentryRoute path="/mission/:id" component={getMissionView} />
      <SentryRoute path="/mission" component={List} />
    </Switch>
  );
}
