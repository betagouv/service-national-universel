import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  academyList,
  COHORTS,
  departmentToAcademy,
  ES_NO_LIMIT,
  region2department,
  regionList,
  ROLES,
  translateInscriptionStatus,
  translatePhase1,
  YOUNG_STATUS,
  YOUNG_STATUS_PHASE1,
} from "snu-lib";
import ButtonPrimary from "../../../../../components/ui/buttons/ButtonPrimary";
import api from "../../../../../services/api";
import plausibleEvent from "../../../../../services/plausible";
import { getDepartmentOptions, getFilteredDepartment } from "../../../components/common";
import DashboardContainer from "../../../components/DashboardContainer";
import { FilterDashBoard } from "../../../components/FilterDashBoard";
import BoxWithPercentage from "./components/BoxWithPercentage";
import CardCenterCapacity from "./components/CardCenterCapacity";
import MoreInfo from "./components/MoreInfo";
import OccupationCardHorizontal from "./components/OccupationCardHorizontal";
import Presences from "./components/Presences";
import StatusPhase1 from "./components/StatusPhase1";
import TabSession from "./components/TabSession";
import { getLink as getOldLink } from "../../../../../utils";
import { getNewLink } from "../../../../../utils";
import { orderCohort } from "../../../../../components/filters-system-v2/components/filters/utils";

export default function Index() {
  const user = useSelector((state) => state.Auth.user);

  //useStates
  const [selectedFilters, setSelectedFilters] = useState({
    status: [YOUNG_STATUS.VALIDATED],
    statusPhase1: [YOUNG_STATUS_PHASE1.AFFECTED],
    cohorts: ["Février 2023 - C", "Avril 2023 - A", "Avril 2023 - B", "Juin 2023", "Juillet 2023", "Octobre 2023 - NC"],
    region: user.role === ROLES.REFERENT_REGION ? [user.region] : [],
    department: user.role === ROLES.REFERENT_DEPARTMENT ? [...user.department] : [],
    academy: [],
  });
  const [filterArray, setFilterArray] = useState([]);
  const [data, setData] = useState({});
  const [dataCenter, setDataCenter] = useState({});
  const [sessionList, setSessionList] = useState(null);
  const [sessionByCenter, setSessionByCenter] = useState(null);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const regionOptions = user.role === ROLES.REFERENT_REGION ? [{ key: user.region, label: user.region }] : regionList.map((r) => ({ key: r, label: r }));
  const academyOptions =
    user.role === ROLES.REFERENT_REGION
      ? [...new Set(region2department[user.region].map((d) => departmentToAcademy[d]))].map((a) => ({ key: a, label: a }))
      : academyList.map((a) => ({ key: a, label: a }));

  useEffect(() => {
    let filters = [
      {
        id: "status",
        name: "Statut d’inscription",
        fullValue: "Tous",
        options: Object.keys(YOUNG_STATUS).map((status) => ({ key: status, label: translateInscriptionStatus(status) })),
      },
      {
        id: "statusPhase1",
        name: "Statut de phase 1",
        fullValue: "Tous",
        fixed: [YOUNG_STATUS_PHASE1.AFFECTED],
        options: Object.keys(YOUNG_STATUS_PHASE1)
          .filter((s) => ![YOUNG_STATUS_PHASE1.WAITING_LIST, YOUNG_STATUS_PHASE1.WITHDRAWN, YOUNG_STATUS_PHASE1.WAITING_AFFECTATION].includes(s))
          .map((status) => ({ key: status, label: translatePhase1(status) })),
      },
      ![ROLES.REFERENT_DEPARTMENT].includes(user.role)
        ? {
            id: "region",
            name: "Région",
            fullValue: "Toutes",
            options: regionOptions,
          }
        : null,
      ![ROLES.REFERENT_DEPARTMENT].includes(user.role)
        ? {
            id: "academy",
            name: "Académie",
            fullValue: "Toutes",
            options: academyOptions,
          }
        : null,
      {
        id: "department",
        name: "Département",
        fullValue: "Tous",
        options: departmentOptions,
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
  }, [departmentOptions]);

  const queryCenter = async () => {
    const { resultCenter, sessionByCenter, resultYoung } = await api.post("/elasticsearch/dashboard/moderator/sejour", {
      filters: Object.fromEntries(Object.entries(selectedFilters)),
    });
    setDataCenter(resultCenter);
    setSessionByCenter(sessionByCenter);
    setData(resultYoung);
  };

  useEffect(() => {
    queryCenter();
    if (user.role === ROLES.REFERENT_DEPARTMENT) getDepartmentOptions(user, setDepartmentOptions);
    else getFilteredDepartment(setSelectedFilters, selectedFilters, setDepartmentOptions, user);
  }, [JSON.stringify(selectedFilters)]);
  return (
    <DashboardContainer
      active="sejour"
      availableTab={["general", "engagement", "sejour", "inscription", "analytics"]}
      navChildren={
        <div className="flex items-center gap-2">
          <ButtonPrimary
            className="text-sm"
            onClick={() => {
              plausibleEvent("Dashboard/CTA - Exporter statistiques séjour");
              print();
            }}>
            Exporter les statistiques <span className="font-bold">“Séjour”</span>
          </ButtonPrimary>
        </div>
      }>
      <div className="flex flex-col gap-8">
        <FilterDashBoard selectedFilters={selectedFilters} setSelectedFilters={setSelectedFilters} filterArray={filterArray} />
        <h1 className="text-[28px] font-bold leading-8 text-gray-900">Volontaires</h1>
        <div className="flex items-stretch gap-4 ">
          <div className="flex w-[30%] flex-col gap-4">
            <BoxWithPercentage
              total={data?.pdrTotal || 0}
              number={data?.pdr?.NR + data?.pdr?.false || 0}
              title="Point de rassemblement"
              subLabel="restants à confirmer"
              redirect={getOldLink({ base: `/volontaire`, filter: selectedFilters, filtersUrl: ['MEETING_INFO=%5B"false"%5D'] })}
            />
            <BoxWithPercentage
              total={data?.participationTotal || 0}
              number={data?.participation?.false || 0}
              title="Participation"
              subLabel="restants à confirmer"
              redirect={getOldLink({ base: `/volontaire`, filter: selectedFilters, filtersUrl: ['COHESION_PARTICIPATION=%5B"false"%5D'] })}
            />
          </div>
          <StatusPhase1 statusPhase1={data?.statusPhase1} total={data?.statusPhase1Total} filter={selectedFilters} />
        </div>
        <Presences presence={data?.presence} JDM={data?.JDM} depart={data?.depart} departTotal={data?.departTotal} departMotif={data?.departMotif} filter={selectedFilters} />
        <h1 className="text-[28px] font-bold leading-8 text-gray-900">Centres</h1>
        <div className="grid grid-cols-3 gap-4">
          <CardCenterCapacity
            nbCenter={dataCenter?.totalCenter || 0}
            capacity={dataCenter?.capacity || 0}
            redirect={getNewLink({ base: "/centre/liste/liste-centre", filter: selectedFilters }, "center")}
          />
          <OccupationCardHorizontal total={dataCenter?.placesTotalSession || 0} taken={dataCenter?.placesTotalSession - dataCenter?.placesLeftSession || 0} />
          <BoxWithPercentage
            total={dataCenter?.totalSession || 0}
            number={dataCenter?.timeSchedule?.false || 0}
            title="Emplois du temps"
            subLabel="restants à renseigner"
            redirect={getNewLink({ base: `/centre/liste/session`, filter: selectedFilters, filtersUrl: ["hasTimeSchedule=false"] }, "session")}
          />
        </div>
        <div className="flex gap-4">
          <MoreInfo typology={dataCenter?.typology} domains={dataCenter?.domains} filter={selectedFilters} />
          {/* <TabSession sessionList={sessionList} filters={selectedFilters} /> */}
          <TabSession sessionByCenter={sessionByCenter} filters={selectedFilters} />
        </div>
      </div>
    </DashboardContainer>
  );
}
