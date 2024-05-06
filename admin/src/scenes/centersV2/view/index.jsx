import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Redirect } from "react-router-dom";
import { toastr } from "react-redux-toastr";

import { COHESION_STAY_START } from "snu-lib";

import api from "@/services/api";
import { ROLES, translate } from "@/utils";
import Breadcrumbs from "@/components/Breadcrumbs";
import Loader from "@/components/Loader";

import CenterInformations from "./CenterInformations";
import SessionList from "../components/sessions/SessionList";

export default function Index({ ...props }) {
  const { user } = useSelector((state) => state.Auth);
  const [center, setCenter] = useState();
  const [sessions, setSessions] = useState();

  useEffect(() => {
    (async () => {
      const id = props.match && props.match.params && props.match.params.id;
      if (!id) return <div />;

      const centerResponse = await api.get(`/cohesion-center/${id}`);
      if (!centerResponse.ok) {
        toastr.error("Oups, une erreur est survenue lors de la récupération de la mission", translate(centerResponse.code));
        return <Redirect to="/centre" />;
      }
      setCenter(centerResponse.data);
    })();
  }, [props.match.params.id]);

  const getCenter = () => {
    (async () => {
      if (!center || !center?.cohorts) return;
      const allSessions = await api.get(`/cohesion-center/${center._id}/session-phase1`);
      if (!allSessions.ok) {
        return toastr.error("Oups, une erreur est survenue lors de la récupération des sessions", translate(allSessions.code));
      }
      for (let i = 0; i < allSessions.data.length; i++) {
        const { schema } = await api.get(`/session-phase1/${allSessions.data[i]._id}/schema-repartition`);
        if (schema?.length === 0 && allSessions.data[i].placesTotal - allSessions.data[i].placesLeft === 0) {
          allSessions.data[i].canBeDeleted = true;
        } else {
          allSessions.data[i].canBeDeleted = false;
        }
      }
      if (allSessions.data.length === 0) setSessions([]);

      if ([ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT, ROLES.TRANSPORTER].includes(user.role)) {
        allSessions.data = allSessions.data.map((session) => {
          return {
            ...session,
            hasSpecificDate: session?.dateStart && session?.dateEnd ? true : false,
          };
        });
        allSessions.data.sort((a, b) => COHESION_STAY_START[a.cohort] - COHESION_STAY_START[b.cohort]);
        setSessions(allSessions.data);
      } else {
        const sessionFiltered = allSessions.data
          .filter((session) => session.headCenterId === user._id)
          .map((session) => {
            return {
              ...session,
              hasSpecificDate: session?.dateStart && session?.dateEnd ? true : false,
            };
          });
        sessionFiltered.sort((a, b) => COHESION_STAY_START[a.cohort] - COHESION_STAY_START[b.cohort]);
        setSessions(sessionFiltered);
      }
    })();
  };
  useEffect(() => {
    getCenter();
  }, [center]);

  if (!center || !sessions) return <Loader />;

  return (
    <>
      {user.role !== ROLES.HEAD_CENTER && <Breadcrumbs items={[{ label: "Centres", to: "/centre" }, { label: "Fiche du centre" }]} />}
      <CenterInformations center={center} setCenter={setCenter} sessions={sessions} />
      <SessionList center={center} setCenter={setCenter} sessions={sessions} setSessions={setSessions} user={user} />
    </>
  );
}
