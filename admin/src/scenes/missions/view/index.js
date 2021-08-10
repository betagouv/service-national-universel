import React, { useEffect, useState } from "react";
import { Switch, Route, useHistory } from "react-router-dom";

import api from "../../../services/api";
import Details from "./details";
import Youngs from "./youngs";
import Historic from "./history";
import { toastr } from "react-redux-toastr";
import { translate } from "../../../utils";

export default ({ ...props }) => {
  const [mission, setMission] = useState();
  const [tutor, setTutor] = useState();
  const [structure, setStructure] = useState();
  const [applications, setApplications] = useState();
  const history = useHistory();

  useEffect(() => {
    (async () => {
      const id = props.match && props.match.params && props.match.params.id;
      if (!id) return <div />;

      const missionResponse = await api.get(`/mission/${id}`);
      if (!missionResponse.ok) {
        toastr.error("Oups, une erreur est survenue lors de la récupération de la mission", translate(missionResponse.code));
        return history.push("/mission");
      }
      setMission(missionResponse.data);

      const structureResponse = await api.get(`/structure/${missionResponse.data.structureId}`);
      if (!structureResponse.ok) {
        toastr.error("Oups, une erreur est survenue lors de la récupération de la structure", translate(structureResponse.code));
        return history.push("/mission");
      }
      setStructure(structureResponse.data);

      if (missionResponse.data.tutorId) {
        console.log(missionResponse.data.tutorId);
        const tutorResponse = await api.get(`/referent/${missionResponse.data.tutorId}`);
        if (!tutorResponse.ok) {
          toastr.error("Oups, une erreur est survenue lors de la récupération du tuteur", translate(tutorResponse.code));
          return history.push("/mission");
        }
        setTutor(tutorResponse.data);
      }

      const applicationResponse = await api.get(`/mission/${missionResponse.data._id}/application`);
      if (!applicationResponse.ok) {
        toastr.error("Oups, une erreur est survenue lors de la récupération des volontaires", translate(applicationResponse.code));
        return history.push("/mission");
      }
      setApplications(applicationResponse.data);
    })();
  }, [props.match.params.id]);

  if (!mission) return <div />;
  return (
    <Switch>
      <Route path="/mission/:id/youngs" component={() => <Youngs mission={mission} applications={applications} />} />
      <Route path="/mission/:id/historique" component={() => <Historic mission={mission} />} />
      <Route path="/mission/:id" component={() => <Details mission={mission} structure={structure} tutor={tutor} />} />
    </Switch>
  );
};
