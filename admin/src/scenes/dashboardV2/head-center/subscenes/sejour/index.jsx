import api from "@/services/api";
import { getNewLink } from "@/utils";
import queryString from "query-string";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { COHORTS, YOUNG_STATUS, translate } from "snu-lib";
import DashboardContainer from "../../../components/DashboardContainer";
import { FilterDashBoard } from "../../../components/FilterDashBoard";
import BoxWithPercentage from "../../../moderator-ref/subscenes/sejour/components/BoxWithPercentage";
import Details from "./components/Details";
import Presences from "../../../moderator-ref/subscenes/sejour/components/Presences";
import StatusSejour from "./components/StatusSejour";

export default function Index() {
  const user = useSelector((state) => state.Auth.user);
  const session = useSelector((state) => state.Auth.sessionPhase1);

  const cohort = session?.cohort;
  const sessionId = session?._id;
  const centerId = session?.cohesionCenterId;

  const [selectedFilters, setSelectedFilters] = useState({
    status: [YOUNG_STATUS.VALIDATED],
    cohort: [cohort],
  });
  const [filterArray, setFilterArray] = useState([]);
  const [data, setData] = useState({});

  useEffect(() => {
    getCentersId();
  }, []);

  useEffect(() => {
    let filters = [
      {
        id: "status",
        name: "Statut",
        fullValue: "Tous",
        options: [YOUNG_STATUS.VALIDATED, YOUNG_STATUS.WITHDRAWN].map((status) => ({ key: status, label: translate(status) })),
      },
      {
        id: "cohort",
        name: "Cohorte",
        fullValue: `${session?.cohort}`,
        options: [{ key: cohort, label: cohort }],
      },
    ].filter((e) => e);
    setFilterArray(filters);
    setSelectedFilters({ ...selectedFilters, cohort: [cohort] });
  }, [session, cohort]);

  useEffect(() => {
    queryCenter();
  }, [JSON.stringify(selectedFilters), cohort, centerId]);

  const queryCenter = async () => {
    const { resultYoung } = await api.post("/elasticsearch/dashboard/sejour/head-center", {
      filters: Object.fromEntries(Object.entries(selectedFilters)),
    });
    setData(resultYoung);
  };

  const getCentersId = async () => {
    const { ok, data } = await api.get(`/session-phase1/headCenter/${user._id}`);
    if (!ok) return;
    setSelectedFilters({
      ...selectedFilters,
      cohesionCenterId: data.map((session) => session.cohesionCenterId),
    });
  };

  return (
    <DashboardContainer active="sejour" availableTab={["general", "sejour"]}>
      <div className="flex flex-col gap-8">
        <FilterDashBoard selectedFilters={selectedFilters} setSelectedFilters={setSelectedFilters} filterArray={filterArray} />
        <h1 className="text-[28px] font-bold leading-8 text-gray-900">Général</h1>
        <div className="flex items-stretch gap-4 ">
          <div className="flex w-[30%] flex-col gap-4">
            <BoxWithPercentage
              total={data?.sanitaryTotal || 0}
              number={data?.sanitary?.false || 0}
              title="Fiches Sanitaires"
              subLabel="non receptionnées"
              redirect={getNewLink({
                base: `/centre/${centerId}/${sessionId}/fiche-sanitaire`,
                filter: selectedFilters,
                filtersUrl: [queryString.stringify({ cohesionStayMedicalFileReceived: "false" })],
              })}
            />
            <BoxWithPercentage
              total={data?.participationTotal || 0}
              number={data?.participation?.false || 0}
              title="Participation"
              subLabel="restants à confirmer"
              redirect={getNewLink({
                base: `/centre/${centerId}/${sessionId}/general`,
                filter: selectedFilters,
                filtersUrl: [queryString.stringify({ youngPhase1Agreement: "false" })],
              })}
            />
          </div>
          <StatusSejour statusPhase1={data?.statusPhase1} total={data?.statusPhase1Total} filter={selectedFilters} sessionId={sessionId} centerId={centerId} />
        </div>
        <Presences
          presence={data?.presence}
          JDM={data?.JDM}
          depart={data?.depart}
          departTotal={data?.departTotal}
          departMotif={data?.departMotif}
          filter={selectedFilters}
          sessionId={sessionId}
          centerId={centerId}
        />
        <Details selectedFilters={selectedFilters} sessionId={sessionId} centerId={centerId} />
      </div>
    </DashboardContainer>
  );
}
