import { orderCohort } from "@/components/filters-system-v2/components/filters/utils";
import api from "@/services/api";
import { getNewLink } from "@/utils";
import queryString from "query-string";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { COHORTS, ROLES, YOUNG_STATUS, translateInscriptionStatus } from "snu-lib";
import DashboardContainer from "../../../components/DashboardContainer";
import { FilterDashBoard } from "../../../components/FilterDashBoard";
import BoxWithPercentage from "../../../moderator-ref/subscenes/sejour/components/BoxWithPercentage";
import Details from "../../../components/inscription/Details";
import Presences from "../../../moderator-ref/subscenes/sejour/components/Presences";
import StatusSejour from "./components/StatusSejour";

export default function Index() {
  const user = useSelector((state) => state.Auth.user);

  const [selectedFilters, setSelectedFilters] = useState({
    status: [YOUNG_STATUS.VALIDATED],
    cohorts: ["Février 2023 - C", "Avril 2023 - A", "Avril 2023 - B", "Juin 2023", "Juillet 2023", "Octobre 2023 - NC"],
  });
  const [filterArray, setFilterArray] = useState([]);
  const [data, setData] = useState({});
  const [dataCenter, setDataCenter] = useState({});

  useEffect(() => {
    let filters = [
      {
        id: "status",
        name: "Statut",
        fullValue: "Tous",
        options: Object.keys(YOUNG_STATUS).map((status) => ({ key: status, label: translateInscriptionStatus(status) })),
      },
      {
        id: "cohorts",
        name: "Cohorte",
        fullValue: "Toutes",
        options: COHORTS.map((cohort) => ({ key: cohort, label: cohort })),
        sort: (e) => orderCohort(e),
      },
    ].filter((e) => e);
    setFilterArray(filters);
  }, []);

  const queryCenter = async () => {
    const { resultCenter, sessionByCenter, resultYoung } = await api.post("/elasticsearch/dashboard/sejour/head-center", {
      filters: Object.fromEntries(Object.entries(selectedFilters)),
    });
    console.log(resultYoung);
    //setDataCenter(resultCenter);
    //setSessionByCenter(sessionByCenter);
    setData(resultYoung);
  };

  useEffect(() => {
    queryCenter();
  }, [JSON.stringify(selectedFilters)]);

  return (
    <DashboardContainer active="sejour" availableTab={["general", "sejour"]}>
      <div className="flex flex-col gap-8">
        <FilterDashBoard selectedFilters={selectedFilters} setSelectedFilters={setSelectedFilters} filterArray={filterArray} />
        <h1 className="text-[28px] font-bold leading-8 text-gray-900">Général</h1>
        <div className="flex items-stretch gap-4 ">
          <div className="flex w-[30%] flex-col gap-4">
            <BoxWithPercentage
              total={data?.pdrTotal || 0}
              number={data?.pdr?.NR + data?.pdr?.false || 0}
              title="Fiches Sanitaires"
              subLabel="non receptionnées"
              redirect={getNewLink({ base: `/volontaire`, filter: selectedFilters, filtersUrl: [queryString.stringify({ hasMeetingInformation: "false" })] })}
            />
            <BoxWithPercentage
              total={data?.participationTotal || 0}
              number={data?.participation?.false || 0}
              title="Participation"
              subLabel="restants à confirmer"
              redirect={getNewLink({ base: `/volontaire`, filter: selectedFilters, filtersUrl: [queryString.stringify({ youngPhase1Agreement: "false" })] })}
            />
          </div>
          <StatusSejour statusPhase1={data?.statusPhase1} total={data?.statusPhase1Total} filter={selectedFilters} />
        </div>
        <Presences presence={data?.presence} JDM={data?.JDM} depart={data?.depart} departTotal={data?.departTotal} departMotif={data?.departMotif} filter={selectedFilters} />
        <Details selectedFilter={selectedFilters} />
      </div>
    </DashboardContainer>
  );
}
