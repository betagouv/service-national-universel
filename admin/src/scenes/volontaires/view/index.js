import React, { useEffect, useState } from "react";
import { Switch, Route } from "react-router-dom";

import api from "../../../services/api";
import Details from "./details";
import Phase1 from "./phase1";
import Phase2 from "./phase2";
import Phase3 from "./phase3";

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
      <Route path="/volontaire/:id/phase1" component={() => <Phase1 young={young} />} />
      <Route path="/volontaire/:id/phase2" component={() => <Phase2 young={young} />} />
      <Route path="/volontaire/:id/phase3" component={() => <Phase3 young={young} />} />
      <Route path="/volontaire/:id" component={() => <Details young={young} />} />
    </Switch>
  );
};
