import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { HiHome } from "react-icons/hi";

import { departmentList, regionList, ROLES, translateInscriptionStatus, getDepartmentNumber } from "snu-lib";
import { YOUNG_STATUS } from "snu-lib";
import { academyList, academyToDepartments, departmentToAcademy } from "snu-lib";
import { department2region, region2department } from "snu-lib";
import { getCohortNameList } from "@/services/cohort.service";
import { Page, Header, DropdownButton, ModalConfirmation } from "@snu/ds/admin";

import DashboardContainer from "../../../components/DashboardContainer";
import { FilterDashBoard } from "../../../components/FilterDashBoard";
import Section from "../../../components/ui/Section";
import VolontairesStatutsDePhase from "./components/VolontairesStatutsDePhase";
import VolontairesStatutsDivers from "./components/VolontairesStatutsDivers";
import SectionStructures from "./components/SectionStructures";
import SectionMissions from "./components/SectionMissions";
import plausibleEvent from "../../../../../services/plausible";
import { orderCohort } from "../../../../../components/filters-system-v2/components/filters/utils";
import ExportEngagementReport from "./components/ExportEngagementReport";
import VolontairesEquivalenceMig from "./components/VolontairesEquivalenceMig";
import BandeauInfo from "../../../components/BandeauInfo";

export default function Index() {
  const user = useSelector((state) => state.Auth.user);
  const cohorts = useSelector((state) => state.Cohorts);
  const [modalExport, setModalExport] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("0 %");

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
        options: getCohortNameList(cohorts).map((cohort) => ({ key: cohort, label: cohort })),
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

  const selectOptions = [
    {
      key: "1",
      title: "Exporter",
      items: [
        {
          key: "1.1",
          render: (
            <p>
              Le rapport <span>"Engagement"</span>
            </p>
          ),
          action: () => {
            setModalExport(true);
          },
        },
        {
          key: "1.2",
          render: (
            <p>
              Les statistiques <span>"Engagement"</span>
            </p>
          ),
          action: () => {
            plausibleEvent("Dashboard/CTA - Exporter statistiques engagement");
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
        breadcrumb={[{ title: "Tableau de bord" }]}
        actions={[<DropdownButton title={"Exporter"} optionsGroup={selectOptions} key={"export"} position="right" />]}
      />
      <DashboardContainer availableTab={["general", "engagement", "sejour", "inscription"]} active="engagement">
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
      <ModalConfirmation
        isOpen={modalExport}
        onClose={() => {
          setModalExport(false);
        }}
        className="md:max-w-[700px]"
        title="Téléchargement"
        text="En téléchargeant ces informations, vous vous engagez à les supprimer après consultation en application des dispositions légales sur la protection des données personnelles (RGPD, CNIL)"
        actions={[
          { title: "Annuler", isCancel: true },
          {
            title: `${loading ? `Téléchargement ${loadingText}` : "Confirmer"}`,
            disabled: loading,
            onClick: () => {
              plausibleEvent("Dashboard/CTA - Exporter rapport Engagement");
              ExportEngagementReport({ filter: selectedFilters, user, setLoading, setLoadingText });
            },
          },
        ]}
      />
    </Page>
  );
}
