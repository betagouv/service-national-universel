import React, { useEffect, useState } from "react";
import ButtonPrimary from "../../../../../components/ui/buttons/ButtonPrimary";
import DashboardContainer from "../../../components/DashboardContainer";
import { FilterDashBoard } from "../../../components/FilterDashBoard";
import { getCohortNames, departmentList, regionList, ROLES, translateInscriptionStatus, getDepartmentNumber } from "snu-lib";
import { YOUNG_STATUS } from "snu-lib/constants";
import { useSelector } from "react-redux";
import { academyList, academyToDepartments, departmentToAcademy } from "snu-lib/academy";
import { department2region, region2department } from "snu-lib/region-and-departments";
import Section from "../../../components/ui/Section";
import VolontairesStatutsDePhase from "./components/VolontairesStatutsDePhase";
import VolontairesStatutsDivers from "./components/VolontairesStatutsDivers";
import SectionStructures from "./components/SectionStructures";
import SectionMissions from "./components/SectionMissions";
import plausibleEvent from "../../../../../services/plausible";
import { orderCohort } from "../../../../../components/filters-system-v2/components/filters/utils";
import ExportEngagementReport from "./components/ExportEngagementReport";
import VolontairesEquivalenceMig from "./components/VolontairesEquivalenceMig";
import { getCohortNameList } from "@/services/cohort.service";

export default function Index() {
  const user = useSelector((state) => state.Auth.user);
  const cohorts = useSelector((state) => state.Cohorts);

  const [selectedFilters, setSelectedFilters] = useState({
    status: [YOUNG_STATUS.VALIDATED],
    region: user.role === ROLES.REFERENT_REGION ? [user.region] : [],
    academy: [],
    department: user.role === ROLES.REFERENT_DEPARTMENT ? [...user.department] : [],
    cohorts: [],
  });

  const [filterArray, setFilterArray] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);

  useEffect(() => {
    let filters = [
      {
        id: "status",
        name: "Statut d’inscription",
        fullValue: "Tous",
        options: Object.keys(YOUNG_STATUS).map((status) => ({ key: status, label: translateInscriptionStatus(status) })),
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
        id: "cohorts",
        name: "Cohorte",
        fullValue: "Toutes",
        options: getCohortNames().map((cohort) => ({ key: cohort, label: cohort })),
        sort: (e) => orderCohort(e),
      },
    ].filter((e) => e);
    setFilterArray(filters);
  }, [departmentOptions]);

  useEffect(() => {
    loadData();
    if (user.role === ROLES.REFERENT_DEPARTMENT) {
      computeDepartmentOptions();
    } else {
      computeFilteredDepartment();
    }
  }, [JSON.stringify(selectedFilters)]);

  useEffect(() => {
    const cohortsFilters = getCohortNameList(cohorts).filter((e) => e.match(/2024/));
    setSelectedFilters({ ...selectedFilters, cohorts: cohortsFilters });
  }, []);

  const regionOptions = user.role === ROLES.REFERENT_REGION ? [{ key: user.region, label: user.region }] : regionList.map((r) => ({ key: r, label: r }));
  const academyOptions =
    user.role === ROLES.REFERENT_REGION
      ? [...new Set(region2department[user.region].map((d) => departmentToAcademy[d]))].map((a) => ({ key: a, label: a }))
      : academyList.map((a) => ({ key: a, label: a }));

  const computeFilteredDepartment = () => {
    if (selectedFilters.academy?.length) {
      setSelectedFilters({ ...selectedFilters, department: selectedFilters?.department?.filter((d) => selectedFilters.academy?.includes(departmentToAcademy[d])) });
      return setDepartmentOptions(
        selectedFilters.academy?.reduce((previous, current) => {
          return [...previous, ...(academyToDepartments[current] || []).map((d) => ({ key: d, label: d }))];
        }, []) || [],
      );
    }
    if (!selectedFilters.region?.length) return setDepartmentOptions(departmentList?.map((d) => ({ key: d, label: d })));
    setSelectedFilters({ ...selectedFilters, department: selectedFilters?.department?.filter((d) => selectedFilters.region?.includes(department2region[d])) });
    setDepartmentOptions(selectedFilters.region?.reduce((previous, current) => previous?.concat(region2department[current]?.map((d) => ({ key: d, label: d }))), []));
  };

  const computeDepartmentOptions = () => {
    setDepartmentOptions(user?.department?.map((d) => ({ key: d, label: d })));
  };

  async function loadData() {}

  return (
    <DashboardContainer
      availableTab={["general", "engagement", "sejour", "inscription"]}
      active="engagement"
      navChildren={
        <div className="flex items-center gap-2">
          <ExportEngagementReport filter={selectedFilters} />
          <ButtonPrimary
            className="text-sm"
            onClick={() => {
              plausibleEvent("Dashboard/CTA - Exporter statistiques engagement");
              print();
            }}>
            Exporter les statistiques <span className="font-bold">“Engagement”</span>
          </ButtonPrimary>
        </div>
      }>
      <FilterDashBoard selectedFilters={selectedFilters} setSelectedFilters={setSelectedFilters} filterArray={filterArray} />
      <Section title="Volontaires">
        <div className="flex">
          <VolontairesStatutsDePhase filters={selectedFilters} className="mr-4 flex-[0_0_332px]" />
          <VolontairesStatutsDivers filters={selectedFilters} className="grow" />
        </div>
        <VolontairesEquivalenceMig filters={selectedFilters} />
      </Section>
      <SectionStructures filters={selectedFilters} />
      <SectionMissions filters={selectedFilters} />
    </DashboardContainer>
  );
}
