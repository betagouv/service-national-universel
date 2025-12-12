import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { useSelector } from "react-redux";

import { toastr } from "react-redux-toastr";

import { Container, InputText, InputNumber, Label } from "@snu/ds/admin";

import { canPutSpecificDateOnSessionPhase1, CohesionCenterType, ROLES, isAdmin, isSessionEditionOpen, isSuperAdmin } from "snu-lib";
import { capture } from "@/sentry";
import api from "@/services/api";
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
  onCenterChange: React.Dispatch<React.SetStateAction<CohesionCenterType>>;
  sessions: Session[];
  onSessionsChange: React.Dispatch<React.SetStateAction<Session[]>>;
  onRefetchSessions: () => void;
};

type Errors = {
  [key: string]: string;
};

export default function SessionList({ center, onCenterChange, sessions, onSessionsChange, onRefetchSessions }: Props) {
  const history = useHistory();
  const cohorts = useSelector((state: CohortState) => state.Cohorts);
  const user = useSelector((state: AuthState) => state.Auth.user);

  const cohortParam = new URLSearchParams(location.search).get("cohorte");
  const session = cohortParam ? sessions.find((session) => session.cohort === cohortParam) : getDefaultSession(sessions, cohorts);
  const cohort = cohorts.find((cohort) => cohort.name === session?.cohort);
  const setSession = (newSession: Session) => onSessionsChange(sessions.map((session) => (session._id === newSession._id ? newSession : session)));

  const [values, setValues] = useState<Session | null>(null);
  const [errors, setErrors] = useState<Errors>({});

  if (!session || !cohort) return <div></div>;

  const isEditionAllowed = isSessionEditionOpen(user, cohort);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!values) return;

    const errorsObject: Errors = {};
    if (isNaN(values.placesTotal)) {
      errorsObject.placesTotal = "Le nombre de places est incorrect";
    } else if (values.placesTotal < session.placesTotal - session.placesLeft) {
      errorsObject.placesTotal = "Le nombre de places total est inférieur au nombre d'inscrits";
    }
    if (values.dateStart && values.dateEnd && new Date(values.dateStart) > new Date(values.dateEnd)) {
      errorsObject.date = "La date de début doit être antérieure à la date de fin";
    }

    if (Object.keys(errorsObject).length > 0) {
      setErrors(errorsObject);
      return;
    }

    // Restriction d'édition en fonction du rôle de l'utilisateur et de l'état de la session
    const dataToSend: Partial<Session> | null = values;

    if (!isEditionAllowed) {
      // Vérification supplémentaire pour bloquer la soumission si l'assignement est ouvert pour les jeunes
      if (cohort.isAssignmentAnnouncementsOpenForYoung) {
        toastr.error("Vous ne pouvez pas modifier cette session pour le moment.", "OPERATION_UNAUTHORIZED");
        return;
      }
    }

    try {
      const { ok, code, data } = await api.put(`/session-phase1/${session._id}`, dataToSend);
      if (!ok) {
        toastr.error("Oups, une erreur est survenue lors de la modification du centre", code || "");

        return;
      }
      toastr.success("La session a bien été modifiée avec succès", "");
      setSession(data);
      setValues(null);
      setErrors({});
    } catch (e) {
      capture(e);
      toastr.error("Oups, une erreur est survenue lors de la modification du centre", "");
    }
  };

  const handleToggleDate = () => {
    if (!values) return;
    if (values.dateStart && values.dateEnd) {
      setValues({ ...values, dateStart: null, dateEnd: null });
    } else {
      setValues({
        ...values,
        dateStart: session?.dateStart || cohort?.dateStart?.toString() || new Date().toString(),
        dateEnd: session?.dateEnd || cohort?.dateEnd?.toString() || new Date().toString(),
      });
    }
  };

  const handleSelect = (cohortName: string) => {
    history.push(`?cohorte=${cohortName}`);
  };

  const cannotSelectSEssion = isResponsableDeCentre(user);

  return (
    <div className="mx-8 my-4 space-y-4">
      <form onSubmit={handleSubmit} id="session-form">
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
                  <InputNumber
                    label=""
                    name="placesTotal"
                    value={values ? values?.placesTotal : session.placesTotal}
                    onChange={(e) => {
                      const inputValue = e.target.value;
                      const parsedValue = parseInt(inputValue, 10);
                      if (values) setValues({ ...values, placesTotal: parsedValue });
                    }}
                    readOnly={!values}
                    disabled={!isEditionAllowed}
                  />
                  {errors?.placesTotal && <div className="text-[#EF4444] mx-auto mt-1">{errors?.placesTotal}</div>}
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
                  {errors?.date && <div className="text-[#EF4444] mx-auto mt-1">{errors?.date}</div>}
                </div>
              </div>
              <div className="flex flex-col w-full">
                <ToggleDate
                  label="Dates spécifiques"
                  className={`border ${!isEditionAllowed || !canPutSpecificDateOnSessionPhase1(user) ? "bg-gray-50" : "bg-white"}`}
                  tooltipText={
                    <p>
                      Les dates de cette session diffèrent des dates officielles :{" "}
                      <strong>{`${dayjs(cohort?.dateStart).format("DD")} - ${dayjs(cohort?.dateEnd).format("DD MMMM YYYY")}`}</strong>.
                    </p>
                  }
                  disabled={!isEditionAllowed || !canPutSpecificDateOnSessionPhase1(user)}
                  value={values ? !!values?.dateStart : !!session.dateStart}
                  onChange={handleToggleDate}
                  range={{
                    from: values?.dateStart || session.dateStart,
                    to: values?.dateEnd || session.dateEnd,
                  }}
                  onChangeRange={(range: { to: string; from: string }) => {
                    if (values) setValues({ ...values, dateStart: range?.from, dateEnd: range?.to });
                  }}
                />
                {errors?.date && <div className="text-[#EF4444] mx-auto mt-1">{errors?.date}</div>}
              </div>
              <div className="flex mt-8 text-blue-600">
                <div className="flex max-w-xl flex-1 flex-col items-center justify-between gap-2 bg-white">
                  <SessionVolontairesButton session={cohort} centreId={center?._id} sejour={session} />
                </div>
              </div>
            </div>
          </div>
        </Container>
      </form>
    </div>
  );
}
