import React, { useEffect, useState } from "react";
import { Switch, useHistory } from "react-router-dom";
import { SentryRoute } from "../../../sentry";

import { toastr } from "react-redux-toastr";
import Breadcrumbs from "../../../components/Breadcrumbs";
import useDocumentTitle from "../../../hooks/useDocumentTitle";
import api from "../../../services/api";
import { translate } from "../../../utils";
import Details from "./details";
import Historic from "./history";
import ProposeMission from "./propose-mission";
import Youngs from "./youngs";

export default function Index({ ...props }) {
  const [mission, setMission] = useState(null);
  useDocumentTitle(mission ? `${mission.name}` : "Missions");
  const [tutor, setTutor] = useState(null);
  const [structure, setStructure] = useState(null);
  const [applications, setApplications] = useState(null);
  const history = useHistory();

  const id = props.match && props.match.params && props.match.params.id;

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
        const tutorResponse = await api.get(`/referent/${missionResponse.data.tutorId}`);
        if (!tutorResponse.ok) {
          setTutor(null);
        }
        setTutor(tutorResponse.data);
      }
    })();
  }, [id]);

  useEffect(() => {
    if (mission) fetchApplication();
  }, [mission]);

  async function fetchMission() {
    const missionResponse = await api.get(`/mission/${id}`);
    if (!missionResponse.ok) {
      toastr.error("Oups, une erreur est survenue lors de la récupération de la mission", translate(missionResponse.code));
      return history.push("/mission");
    }
    setMission(missionResponse.data);
  }

  async function fetchApplication() {
    const applicationResponse = await api.get(`/mission/${mission._id}/application`);
    if (!applicationResponse.ok) {
      toastr.error("Oups, une erreur est survenue lors de la récupération des volontaires", translate(applicationResponse.code));
      return history.push("/mission");
    }
    setApplications(applicationResponse.data);
  }

  if (!mission || !applications) return <div />;

  return (
    <div>
      <Breadcrumbs items={[{ label: "Missions", to: "/mission" }, { label: "Fiche de la mission" }]} />
      <Switch>
        <SentryRoute path="/mission/:id/youngs/:tab" component={() => <Youngs mission={mission} updateMission={fetchMission} applications={applications} />} />
        <SentryRoute path="/mission/:id/historique" component={() => <Historic mission={mission} />} />
        <SentryRoute path="/mission/:id/propose-mission" component={() => <ProposeMission mission={mission} updateMission={fetchMission} />} />
        <SentryRoute path="/mission/:id" component={() => <Details getMission={fetchMission} mission={mission} setMission={setMission} structure={structure} tutor={tutor} />} />
      </Switch>
    </div>
  );
}
