import React, { useEffect, useState } from "react";
import { Switch, Route, useHistory } from "react-router-dom";

import api from "../../../services/api";
import Details from "./details";
import Youngs from "./youngs";
import Affectation from "./affectation";
import WaitingList from "./waitingList";
import { toastr } from "react-redux-toastr";
import { translate } from "../../../utils";

export default ({ ...props }) => {
  const [center, setCenter] = useState();
  const history = useHistory();

  useEffect(() => {
    (async () => {
      const id = props.match && props.match.params && props.match.params.id;
      if (!id) return <div />;

      const centerResponse = await api.get(`/cohesion-center/${id}`);
      if (!centerResponse.ok) {
        toastr.error("Oups, une erreur est survenue lors de la récupération de la mission", translate(centerResponse.code));
        return history.push("/center");
      }
      setCenter(centerResponse.data);
    })();
  }, [props.match.params.id]);

  const updateCenter = async () => {
    const { data, ok } = await api.get(`/cohesion-center/${center._id}`);
    if (ok) setCenter(data);
  };

  if (!center) return <div />;
  return (
    <Switch>
      <Route path="/centre/:id/liste-attente" component={() => <WaitingList center={center} updateCenter={updateCenter} />} />
      <Route path="/centre/:id/volontaires" component={() => <Youngs center={center} updateCenter={updateCenter} />} />
      <Route path="/centre/:id/affectation" component={() => <Affectation center={center} updateCenter={updateCenter} />} />
      <Route path="/centre/:id" component={() => <Details center={center} />} />
    </Switch>
  );
};
