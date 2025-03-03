import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { toastr } from "react-redux-toastr";

import api from "@/services/api";
import { CohesionCenterType, ROLES, translate } from "@/utils";

import Breadcrumbs from "@/components/Breadcrumbs";
import Loader from "@/components/Loader";
import CenterInformations from "./CenterInformations";
import SessionList from "../components/sessions/SessionList";
import { capture } from "@/sentry";
import { AuthState } from "@/redux/auth/reducer";
import { Session } from "@/types";

export default function Index() {
  const { id } = useParams<{ id: string }>();
  const { user } = useSelector((state: AuthState) => state.Auth);
  const [center, setCenter] = useState<CohesionCenterType>();
  const [sessions, setSessions] = useState<Session[]>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (!id) return;
      setLoading(true);
      try {
        const centerResponse = await api.get(`/cohesion-center/${id}`);
        if (!centerResponse.ok) {
          throw new Error(translate(centerResponse.code));
        }

        loadSessions(centerResponse.data._id);
        // TODO: handle this in the backend

        setCenter(centerResponse.data);
      } catch (e) {
        capture(e);
        toastr.error("Oups, une erreur est survenue", e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const loadSessions = async (centerId: string) => {
    const allSessions = await api.get(`/cohesion-center/${centerId}/session-phase1`);
    if (!allSessions.ok) {
      throw new Error(translate(allSessions.code));
    }
    const populatedSessions = await populateSessions(allSessions.data);
    const sessionFiltered = filterSessions(populatedSessions, user);
    sessionFiltered.sort((a, b) => a.startDate - b.startDate);
    setSessions(sessionFiltered);
  };

  if (loading) return <Loader />;
  if (!center || !sessions) return <div />;
  return (
    <>
      {user.role !== ROLES.HEAD_CENTER && <Breadcrumbs items={[{ title: "Séjours" }, { label: "Centres", to: "/centre" }, { label: "Fiche du centre" }]} />}
      <CenterInformations center={center} />
      <SessionList center={center} onCenterChange={setCenter} sessions={sessions} onSessionsChange={setSessions} onRefetchSessions={() => loadSessions(center._id)} />
    </>
  );
}

function filterSessions(sessions, user) {
  if ([ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT, ROLES.TRANSPORTER].includes(user.role)) {
    return sessions;
  } else if (user.role === ROLES.HEAD_CENTER) {
    return sessions.filter((session) => session?.headCenterId === user._id);
  }
  return [];
}

async function populateSessions(sessions) {
  for (let i = 0; i < sessions.length; i++) {
    const { data: ligneDeBus } = await api.get(`/session-phase1/${sessions[i]._id}/plan-de-transport`);
    // aucune ligne de bus ne dessert ce centre dans le PDT
    if (ligneDeBus?.length === 0 && sessions[i].placesTotal - sessions[i].placesLeft === 0) {
      sessions[i].canBeDeleted = true;
    } else {
      sessions[i].canBeDeleted = false;
    }
  }
  return sessions;
}
