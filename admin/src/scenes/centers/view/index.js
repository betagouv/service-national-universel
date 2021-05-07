import React, { useEffect, useState } from "react";
import { Switch, Route, useHistory } from "react-router-dom";

import api from "../../../services/api";
import Details from "./details";
import Youngs from "./youngs";
import Historic from "./historic";
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
        toastr.error("Oups, une erreur est survenue lors de la récuperation de la mission", translate(centerResponse.code));
        return history.push("/center");
      }
      setCenter(centerResponse.data);
    })();
  }, [props.match.params.id]);

  if (!center) return <div />;
  return (
    <Switch>
      {/* <Route path="/mission/:id/youngs" component={() => <Youngs center={center} applications={applications} />} /> */}
      {/* <Route path="/mission/:id/historic" component={() => <Historic mission={mission} />} /> */}
      <Route path="/centre/:id" component={() => <Details center={center} />} />
    </Switch>
  );
};
