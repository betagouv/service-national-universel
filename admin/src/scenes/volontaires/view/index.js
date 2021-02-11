import React, { useEffect, useState } from "react";
import { Switch, Route } from "react-router-dom";

import api from "../../../services/api";
import Details from "./details";
import Missions from "./missions";
import Historic from "./historic";

export default ({ ...props }) => {
  const [young, setYoung] = useState();

  useEffect(() => {
    (async () => {
      const id = props.match && props.match.params && props.match.params.id;
      if (!id) return <div />;
      const { data } = await api.get(`/referent/young/${id}`);
      setYoung(data);
    })();
  }, [props.match.params.id]);

  if (!young) return <div />;
  return (
    <Switch>
      <Route path="/volontaire/:id/missions" component={() => <Missions young={young} />} />
      <Route path="/volontaire/:id/historic" component={() => <Historic young={young} />} />
      <Route path="/volontaire/:id" component={() => <Details young={young} />} />
    </Switch>
  );
};
