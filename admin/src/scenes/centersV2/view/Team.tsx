import React from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { CENTER_ROLES, ROLES, translate, SessionPhase1Type } from "snu-lib";
import api from "@/services/api";
import Loader from "@/components/Loader";
import Breadcrumbs from "@/components/Breadcrumbs";
import { Page, Container } from "@snu/ds/admin";

type ChefCenterBlockProps = {
  headCenter: SessionPhase1Type["headCenter"];
};

type TeamBlockProps = {
  team: SessionPhase1Type["team"];
  adjoints: SessionPhase1Type["adjoints"];
};

type GroupAdjointsProps = {
  adjoints: SessionPhase1Type["adjoints"];
  role: string;
};

type GroupTeamProps = {
  team: SessionPhase1Type["team"];
  role: string;
};

// Consultation seule : l'ajout, l'invitation et la suppression de membres de l'équipe ont été supprimés.
export default function Team({ focusedSession: focusedSessionfromProps }) {
  const { id, sessionId } = useParams<{ id: string; sessionId: string }>();

  const { data: fetchedSession } = useQuery({
    queryKey: ["session-phase1", sessionId],
    queryFn: async () => {
      const { data } = await api.get(`/session-phase1/${sessionId}`);
      return data;
    },
    enabled: !!sessionId,
    initialData: focusedSessionfromProps,
  });

  const focusedSession = fetchedSession || focusedSessionfromProps;

  if (!focusedSession) return <Loader />;

  return (
    <Page>
      <Breadcrumbs items={[{ title: "Séjours" }, { label: "Centres", to: "/centre" }, { label: "Fiche du centre", to: `/centre/${id}` }, { label: "Equipe" }]} />
      <Container className="mt-2">
        <div className="flex px-6 py-4">
          <div className="flex flex-col w-full">
            <ChefCenterBlock headCenter={focusedSession.headCenter} />
            <TeamBlock team={focusedSession.team} adjoints={focusedSession.adjoints} />
          </div>
        </div>
      </Container>
    </Page>
  );
}

const ChefCenterBlock = ({ headCenter }: ChefCenterBlockProps) => {
  if (!headCenter)
    return (
      <div className="mb-8">
        <h4 className="mb-0">Aucun Chef de centre</h4>
      </div>
    );
  return (
    <div className="mb-8">
      <h4 className="mb-0">Chef de centre</h4>
      <Link to={`/user/${headCenter._id}`} target="_blank" className="cursor-pointer text-blue-600 hover:text-blue-600 hover:underline">
        {headCenter.firstName} {headCenter.lastName}&nbsp;›
      </Link>
      <div className="flex flex-col gap-4 mt-2 w-3/4">
        <div className="flex flex-col">
          <b>E-mail :</b>
          <p style={{ margin: 0 }}>{headCenter?.email}</p>
        </div>
        {headCenter.phone && (
          <div className="flex items-center justify-between">
            <b>Téléphone fixe :</b>
            <p style={{ margin: 0 }}>{headCenter.phone}</p>
          </div>
        )}
        {headCenter.mobile && (
          <div className="flex items-center justify-between">
            <b>Mobile :</b>
            <p style={{ margin: 0 }}>{headCenter.mobile}</p>
          </div>
        )}
      </div>
    </div>
  );
};

const TeamBlock = ({ team, adjoints }: TeamBlockProps) => {
  return (
    <div>
      <h4>Adjoints ({adjoints?.length || 0})</h4>
      {adjoints?.length === 0 && <p className="italic">Aucun adjoint</p>}

      {Object.values(ROLES)
        .filter((e) => e === ROLES.HEAD_CENTER_ADJOINT || e === ROLES.REFERENT_SANITAIRE)
        .map((role, index) => {
          return <GroupAdjoints key={index} adjoints={adjoints} role={role} />;
        })}

      <h4>Équipe ({team.length})</h4>
      {team.length === 0 && <p className="italic">Aucun membre</p>}

      {Object.values(CENTER_ROLES).map((role, index) => {
        return <GroupTeam key={index} team={team} role={role} />;
      })}
    </div>
  );
};

const GroupAdjoints = ({ adjoints, role }: GroupAdjointsProps) => {
  if (!adjoints) {
    return (
      <div className="mt-2 mb-4">
        <h6>{role}&nbsp;(0)</h6>
      </div>
    );
  }
  const adjointsFiltered =
    role === ROLES.HEAD_CENTER_ADJOINT ? adjoints.filter((e) => e.role === ROLES.HEAD_CENTER_ADJOINT) : adjoints.filter((e) => e.role === ROLES.REFERENT_SANITAIRE);

  return (
    <div className="mt-2 mb-4">
      <h6>
        {translate(role)}&nbsp;({adjointsFiltered.length})
      </h6>
      {adjointsFiltered.map((user, index) => (
        <Link to={`/user/${user._id}`} target="_blank" key={index} className="hover:text-blue-600">
          <div className="flex items-center justify-between rounded-lg p-2 hover:bg-gray-50">
            <div className="flex items-center">
              <div key={index} className="mr-2 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-gray-100 text-xs text-indigo-600">
                {user.firstName?.[0]?.toUpperCase()}
                {user.lastName?.[0]?.toUpperCase()}
              </div>
              <div>
                <p className="m-0">
                  {user.firstName} {user.lastName}
                </p>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

const GroupTeam = ({ team, role }: GroupTeamProps) => {
  const teamFiltered = team.filter((member) => member.role === role);

  return (
    <div className="mt-2 mb-4">
      <h6>
        {role}&nbsp;({teamFiltered.length})
      </h6>
      {teamFiltered.map((user, index) => (
        <div className="flex items-center justify-between rounded-lg p-2 hover:bg-gray-50" key={index}>
          <div className="flex items-center">
            <div key={index} className="mr-2 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-gray-100 text-xs text-indigo-600">
              {user.firstName?.[0]?.toUpperCase()}
              {user.lastName?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="m-0">
                {user.firstName} {user.lastName}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
