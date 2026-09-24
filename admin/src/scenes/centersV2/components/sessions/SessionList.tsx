import React from "react";
import { useHistory } from "react-router-dom";
import { useSelector } from "react-redux";

import { Container, InputNumber, Label } from "@snu/ds/admin";

import { CohesionCenterType } from "snu-lib";
import dayjs from "@/utils/dayjs.utils";

import { CohortState } from "@/redux/cohorts/reducer";
import { AuthState } from "@/redux/auth/reducer";
import { Session } from "@/types";

import SessionHorizontalBar from "@/scenes/dashboardV2/components/graphs/SessionHorizontalBar";

import ToggleDate from "@/components/ui/forms/dateForm/ToggleDate";
import SelectCohort from "@/components/cohorts/SelectCohort";

import { Title } from "../commons";
import { getDefaultSession } from "@/utils/session";
import { isResponsableDeCentre } from "snu-lib";
import SessionVolontairesButton from "./SessionVolontairesButton";

type Props = {
  center: CohesionCenterType;
  sessions: Session[];
};

// Consultation seule : la modification des sessions (places, dates spécifiques) a été supprimée.
export default function SessionList({ center, sessions }: Props) {
  const history = useHistory();
  const cohorts = useSelector((state: CohortState) => state.Cohorts);
  const user = useSelector((state: AuthState) => state.Auth.user);

  const cohortParam = new URLSearchParams(location.search).get("cohorte");
  const session = cohortParam ? sessions.find((session) => session.cohort === cohortParam) : getDefaultSession(sessions, cohorts);
  const cohort = cohorts.find((cohort) => cohort.name === session?.cohort);

  if (!session || !cohort) return <div></div>;

  const handleSelect = (cohortName: string) => {
    history.push(`?cohorte=${cohortName}`);
  };

  const cannotSelectSEssion = isResponsableDeCentre(user);

  return (
    <div className="mx-8 my-4 space-y-4">
      <div>
        <div className="flex items-center justify-between mb-3">
          <Title>Par séjour</Title>
          {!cannotSelectSEssion && (
            <SelectCohort cohort={session?.cohort} withBadge filterFn={(c) => Boolean(sessions.find((s) => s.cohort === c.name))} onChange={handleSelect} key="selectCohort" />
          )}
        </div>
        <Container title="Détails">
          <div className="flex flex-row">
            <div className="w-[45%]">
              <div className="rounded-lg bg-white mb-4">
                <SessionHorizontalBar
                  title="Places"
                  labels={["occupés", "disponibles"]}
                  values={[session.placesTotal - session.placesLeft || 0, session.placesLeft || 0]}
                  goal={session.placesTotal}
                  showTooltips={true}
                />
              </div>
              <div className="flex w-full flex-col items-start justify-center">
                <div className="w-full">
                  <Label
                    className="text-xs leading-5 font-medium mt-2"
                    title="Places ouvertes"
                    name="placesTotal"
                    tooltip="C’est le nombre de places proposées sur un séjour. Cette donnée doit être inférieure ou égale à la capacité maximale d’accueil, elle ne peut lui être supérieure."
                  />
                  <InputNumber label="" name="placesTotal" value={session.placesTotal} onChange={() => {}} readOnly={true} />
                </div>
              </div>
            </div>
            <div className="flex w-[10%] items-center justify-center">
              <div className="h-4/5 w-[1px] border-r-[1px] border-gray-300"></div>
            </div>
            <div className="w-[45%]">
              <p className="mb-3">Dates du séjour</p>
              <div className="flex flex-col w-full">
                <div className="flex flex-col gap-2 rounded-lg bg-gray-100 px-3 py-2 mb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <p className="text-left text-sm text-gray-800">Dates officielles</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-left text-xs text-gray-500">
                      Début : <strong>{cohort ? dayjs(cohort.dateStart).format("DD/MM/YYYY") : ""}</strong>
                    </p>
                    <p className="text-left text-xs text-gray-500 mr-3.5">
                      Fin : <strong>{cohort ? dayjs(cohort.dateEnd).format("DD/MM/YYYY") : ""}</strong>
                    </p>
                    <p className="text-left text-xs text-gray-500"></p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col w-full">
                <ToggleDate
                  label="Dates spécifiques"
                  className="border bg-gray-50"
                  tooltipText={
                    <p>
                      Les dates de cette session diffèrent des dates officielles :{" "}
                      <strong>{`${dayjs(cohort?.dateStart).format("DD")} - ${dayjs(cohort?.dateEnd).format("DD MMMM YYYY")}`}</strong>.
                    </p>
                  }
                  disabled={true}
                  readOnly={true}
                  value={!!session.dateStart}
                  onChange={() => {}}
                  range={{
                    from: session.dateStart,
                    to: session.dateEnd,
                  }}
                  onChangeRange={() => {}}
                />
              </div>
              <div className="flex mt-8 text-blue-600">
                <div className="flex max-w-xl flex-1 flex-col items-center justify-between gap-2 bg-white">
                  <SessionVolontairesButton session={cohort} centreId={center?._id} sejour={session} />
                </div>
              </div>
            </div>
          </div>
        </Container>
      </div>
    </div>
  );
}
