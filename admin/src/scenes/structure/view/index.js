import React, { useEffect, useState } from "react";
import { Switch, Route } from "react-router-dom";

import api from "../../../services/api";
import Details from "./details";
import Missions from "./missions";
import Historic from "./history";

export default ({ ...props }) => {
  const [structure, setStructure] = useState();

  useEffect(() => {
    (async () => {
      const id = props.match && props.match.params && props.match.params.id;
      if (!id) return <div />;
      const { data } = await api.get(`/structure/${id}`);
      setStructure(data);
    })();
  }, [props.match.params.id]);

  if (!structure) return <div />;
  return (
    <Switch>
      <Route path="/structure/:id/missions" component={() => <Missions structure={structure} />} />
      <Route path="/structure/:id/historique" component={() => <Historic structure={structure} />} />
      <Route path="/structure/:id" component={() => <Details structure={structure} />} />
    </Switch>
  );
};
