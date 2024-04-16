import { orderCohort } from "@/components/filters-system-v2/components/filters/utils";
import api from "@/services/api";
import plausibleEvent from "@/services/plausible";
import { getNewLink } from "@/utils";
import queryString from "query-string";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  getCohortNames,
  ROLES,
  YOUNG_STATUS,
  YOUNG_STATUS_PHASE1,
  academyList,
  departmentToAcademy,
  region2department,
  regionList,
  translateInscriptionStatus,
  translatePhase1,
  getDepartmentNumber,
} from "snu-lib";
import DashboardContainer from "../../../components/DashboardContainer";
import { FilterDashBoard } from "../../../components/FilterDashBoard";
import { getDepartmentOptions, getFilteredDepartment } from "../../../components/common";
import BoxWithPercentage from "../../../components/sejour/BoxWithPercentage";
import CardCenterCapacity from "./components/CardCenterCapacity";
import MoreInfo from "./components/MoreInfo";
import OccupationCardHorizontal from "./components/OccupationCardHorizontal";
import Presences from "../../../components/sejour/Presences";
import StatusPhase1 from "../../../components/sejour/StatusPhase1";
import TabSession from "./components/TabSession";
import { getCohortNameList } from "@/services/cohort.service";
import { Page, Header, DropdownButton } from "@snu/ds/admin";
import BandeauInfo from "../../../components/BandeauInfo";
import { HiOutlineChartSquareBar, HiChartSquareBar } from "react-icons/hi";

export default function Index() {
  const user = useSelector((state) => state.Auth.user);
  const cohorts = useSelector((state) => state.Cohorts);

  //useStates
  const [selectedFilters, setSelectedFilters] = useState({
    status: [YOUNG_STATUS.VALIDATED],
    statusPhase1: [YOUNG_STATUS_PHASE1.AFFECTED],
    cohort: [],
    region: user.role === ROLES.REFERENT_REGION ? [user.region] : [],
    department: user.role === ROLES.REFERENT_DEPARTMENT ? [...user.department] : [],
    academy: [],
  });
  const [filterArray, setFilterArray] = useState([]);
  const [data, setData] = useState({});
  const [dataCenter, setDataCenter] = useState({});
  const [sessionByCenter, setSessionByCenter] = useState(null);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const regionOptions = user.role === ROLES.REFERENT_REGION ? [{ key: user.region, label: user.region }] : regionList.map((r) => ({ key: r, label: r }));
  const academyOptions =
    user.role === ROLES.REFERENT_REGION
      ? [...new Set(region2department[user.region].map((d) => departmentToAcademy[d]))].map((a) => ({ key: a, label: a }))
      : academyList.map((a) => ({ key: a, label: a }));
  const [isLoading, setIsLoading] = useState(true);

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
            options: academyOptions.sort((a, b) => a.label.localeCompare(b.label)),
          }
        : null,
      {
        id: "department",
        name: "Département",
        fullValue: "Tous",
        options: departmentOptions,
        translate: (e) => getDepartmentNumber(e) + " - " + e,
      },
      {
        id: "cohort",
        name: "Cohorte",
        fullValue: "Toutes",
        options: getCohortNames().map((cohort) => ({ key: cohort, label: cohort })),
        sort: (e) => orderCohort(e),
      },
    ].filter((e) => e);
    setFilterArray(filters);
  }, [departmentOptions]);

  const queryCenter = async () => {
    const { resultCenter, sessionByCenter, resultYoung } = await api.post("/elasticsearch/dashboard/sejour/moderator", {
      filters: Object.fromEntries(Object.entries(selectedFilters)),
    });
    setDataCenter(resultCenter);
    setSessionByCenter(sessionByCenter);
    setData(resultYoung);
  };

  useEffect(() => {
    if (isLoading) return;
    queryCenter();
    if (user.role === ROLES.REFERENT_DEPARTMENT) getDepartmentOptions(user, setDepartmentOptions);
    else getFilteredDepartment(setSelectedFilters, selectedFilters, setDepartmentOptions, user);
  }, [JSON.stringify(selectedFilters)]);

  useEffect(() => {
    //regex to get all cohort 2024
    const cohortsFilters = getCohortNameList(cohorts).filter((e) => e.match(/2024/));
    setSelectedFilters({ ...selectedFilters, cohort: cohortsFilters });
    setIsLoading(false);
  }, []);

  if (isLoading) return null;

  const selectOptions = [
    {
      key: "1",
      items: [
        {
          key: "1.1",
          render: (
            <>
              <HiChartSquareBar size={34} />
              <p>
                Exporter les statistiques <span>"Séjour"</span>
              </p>
            </>
          ),
          action: () => {
            plausibleEvent("Dashboard/CTA - Exporter statistiques séjour");
            print();
          },
        },
      ],
    },
  ];

  return (
    <Page>
      <BandeauInfo />
      <Header
        title="Tableau de bord"
        breadcrumb={[{ title: <HiOutlineChartSquareBar size={20} /> }, { title: "Tableau de bord" }]}
        actions={[<DropdownButton title={"Exporter"} optionsGroup={selectOptions} key={"export"} position="right" />]}
      />
      <DashboardContainer active="sejour" availableTab={["general", "engagement", "sejour", "inscription"]}>
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
            <TabSession sessionByCenter={sessionByCenter} filters={selectedFilters} />
          </div>
        </div>
      </DashboardContainer>
    </Page>
  );
}
