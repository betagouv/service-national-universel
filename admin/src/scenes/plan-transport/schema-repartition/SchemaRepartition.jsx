import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import * as FileSaver from "file-saver";
import { useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";
import { useHistory, useLocation } from "react-router-dom";

import { department2region, region2department, ROLES, COHORT_TYPE } from "snu-lib";

import { capture } from "@/sentry";
import API from "@/services/api";
import dayjs from "@/utils/dayjs.utils";
import useDocumentTitle from "@/hooks/useDocumentTitle";

import Puzzle from "@/assets/icons/Puzzle";

import Breadcrumbs from "@/components/Breadcrumbs";
import SelectCohort from "@/components/cohorts/SelectCohort";

import BoxVolontaires from "./components/BoxVolontaires";
import BoxAffectation from "./components/BoxAffectation";
import BoxDisponibilite from "./components/BoxDisponibilite";
import BoxCentres from "./components/BoxCentres";
import DetailTable from "./components/DetailTable";
import { exportSRCLE, exportSRHTS } from "./utils";

import { parseQuery } from "../util";
import PlanTransportBreadcrumb from "../components/PlanTransportBreadcrumb";
import { Loading, regionList } from "../components/commons";
import Select from "../components/Select";
import SchemaEditor from "./SchemaEditor";
import SchemaDepartmentDetail from "./SchemaDepartmentDetail";

const ExcelFileType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";

export default function SchemaRepartition({ region, department }) {
  const history = useHistory();
  const location = useLocation();
  const { user } = useSelector((state) => state.Auth);
  const cohortList = useSelector((state) => state.Cohorts);

  const [isNational, setIsNational] = useState(!region && !department);
  const [isDepartmental, setIsDepartmental] = useState(!!(region && department));
  const [cohort, setCohort] = useState(null);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    capacity: 0,
    total: 0,
    assigned: 0,
    intradepartmental: 0,
    intradepartmentalAssigned: 0,
    centers: 0,
    toRegions: [],
  });

  const [data, setData] = useState({ rows: getDefaultRows() });
  const [filteredCohortList, setFilteredCohortList] = useState([]);
  const [exportLoading, setExportLoading] = useState(false);

  if (region) useDocumentTitle(`Schéma de répartition - ${region}`);
  if (department) useDocumentTitle(`Schéma de répartition - ${department}`);
  if (!department && !region) useDocumentTitle("Schéma de répartition");

  const departementsList =
    user.role === ROLES.REFERENT_DEPARTMENT && user.department.length > 1
      ? user.department.map((dept) => ({
          label: dept,
          value: dept,
        }))
      : [];

  useEffect(() => {
    setIsNational(!region && !department);
    setIsDepartmental(!!(region && department));
  }, [region, department]);

  useEffect(() => {
    let updatedCohortsList = [];
    if (cohortList !== null) {
      updatedCohortsList = cohortList.filter((c) => {
        return (
          [ROLES.ADMIN, ROLES.TRANSPORTER].includes(user.role) ||
          (user.role === ROLES.REFERENT_DEPARTMENT && c.schemaAccessForReferentDepartment) ||
          (user.role === ROLES.REFERENT_REGION && c.schemaAccessForReferentRegion)
        );
      });
    }
    const { cohort } = parseQuery(location.search);
    if (cohort && cohortList && updatedCohortsList.find((c) => c.name === cohort)) {
      setCohort(updatedCohortsList.find((c) => c.name === cohort));
    } else {
      setCohort(updatedCohortsList?.[0] || null);
    }
    setFilteredCohortList(updatedCohortsList);
  }, [cohortList]);

  useEffect(() => {
    if (cohort) {
      loadSchemaData();
    }
  }, [cohort]);

  useEffect(() => {
    let capacity = 0;
    let total = 0;
    let assigned = 0;
    let intradepartmental = 0;
    let intradepartmentalAssigned = 0;
    let centers = 0;
    let toRegions = [];

    if (data.toCenters) {
      for (const row of data.toCenters) {
        if (row.name !== "all") {
          toRegions.push({ name: row.name, departments: row.departments });
        }
        capacity += row.capacity ? row.capacity : 0;
        centers += row.centers ? row.centers : 0;
      }
      for (const row of data.rows) {
        total += row.total ? row.total : 0;
        assigned += row.assigned ? row.assigned : 0;
        intradepartmental += row.intradepartmental ? row.intradepartmental : 0;
        intradepartmentalAssigned += row.intradepartmentalAssigned ? row.intradepartmentalAssigned : 0;
      }
    } else {
      for (const row of data.rows) {
        capacity += row.capacity ? row.capacity : 0;
        total += row.total ? row.total : 0;
        assigned += row.assigned ? row.assigned : 0;
        intradepartmental += row.intradepartmental ? row.intradepartmental : 0;
        intradepartmentalAssigned += row.intradepartmentalAssigned ? row.intradepartmentalAssigned : 0;
        centers += row.centers ? row.centers : 0;
      }
    }
    setSummary({ capacity, total, assigned, intradepartmental, intradepartmentalAssigned, centers, toRegions });
  }, [data]);

  function getDefaultRows() {
    if (department) {
      return [];
    } else if (region) {
      return region2department[region].map(createEmptyRow);
    } else {
      return regionList.map(createEmptyRow);
    }
  }

  function createEmptyRow(name) {
    return {
      name,
      capacity: 0,
      total: 0,
      assigned: 0,
      intradepartmental: 0,
      intradepartmentalAssigned: 0,
    };
  }

  async function loadSchemaData() {
    try {
      setLoading(true);
      let url = "/schema-de-repartition";
      if (region) {
        url += "/" + region;
      }
      if (department) {
        url += "/" + department;
      }
      const { data, ok } = await API.get(url + "/" + cohort.name);
      if (!ok) return toastr.error("Oups, une erreur est survenue lors de la récupération des données");
      setData(data);
      setLoading(false);
    } catch (e) {
      capture(e);
      toastr.error("Oups, une erreur est survenue lors de la récupération des données");
    }
  }

  function goToNational() {
    if ([ROLES.ADMIN, ROLES.TRANSPORTER, ROLES.REFERENT_REGION].includes(user.role)) {
      history.push("/schema-repartition?cohort=" + cohort.name);
    }
    // if (region && user.role === ROLES.REFERENT_REGION) {
    //   history.push(`/schema-repartition/${region}?cohort=${cohort.name}`);
    // }
  }

  function goToRegion() {
    if (region && user.role !== ROLES.REFERENT_DEPARTMENT) {
      history.push(`/schema-repartition/${region}?cohort=${cohort.name}`);
    }
  }

  // function goToDepartment() {
  //   if (region && department) {
  //     history.push(`/schema-repartition/${region}/${department}?cohort=${cohort.name}`);
  //   }
  // }

  function goToRow(row) {
    if (region) {
      history.push(`/schema-repartition/${region}/${row.name}?cohort=${cohort.name}`);
    } else {
      history.push(`/schema-repartition/${row.name}?cohort=${cohort.name}`);
    }
  }

  async function handleExportDetail() {
    try {
      if (cohort.type === COHORT_TYPE.CLE) {
        await exportSRCLE(cohort.name);
      } else {
        await exportSRHTS(cohort.name, region, department);
        /* const groups = await loadExportData();
        const result = await exportExcelSheet(groups);
        const buffer = XLSX.write(result.workbook, { bookType: "xlsx", type: "array" });
        FileSaver.saveAs(new Blob([buffer], { type: ExcelFileType }), result.fileName); */
      }
    } catch (e) {
      capture(e);
      toastr.error("Oups, une erreur est survenue lors de la récupération des données. Nous ne pouvons exporter les données.");
    }
  }

  async function loadExportData() {
    let url = "/schema-de-repartition/export";
    if (region) {
      url += "/" + region;
    }
    if (department) {
      url += "/" + department;
    }
    url += "/" + cohort;

    const result = await API.get(url);
    if (!result.ok) {
      return toastr.error("Oups, une erreur est survenue lors de la récupération des données");
    }
    return result.data;
  }

  async function exportExcelSheet(groups) {
    let maxGatheringPlaces = 0;

    let sheetData = groups.map((g) => {
      let data = {
        cohort: g.cohort,
        id: g._id.toString(),
        updatedAt: dayjs(g.updatedAt).format("DD/MM/YYYY HH:mm"),
        region: g.fromRegion,
        department: g.fromDepartment,
        youngsVolume: g.youngsVolume,
        centerId: g.centerId,
        centerName: `${g.center.name} ${g.center.address} ${g.center.zip} ${g.center.city}`,
        centerDepartment: g.center.department,
        centerRegion: g.center.region,
      };
      if (maxGatheringPlaces < g.gatheringPlaces.length) {
        maxGatheringPlaces = g.gatheringPlaces.length;
      }
      for (let i = 0, n = g.gatheringPlaces.length; i < n; ++i) {
        const pdr = g.gatheringPlaces[i];
        data["gpId" + i] = pdr._id;
        data["gpName" + i] = `${pdr.name} ${pdr.address} ${pdr.zip} ${pdr.city}`;
      }
      return data;
    });

    // tri par centre
    sheetData.sort((a, b) => {
      const aname = a.centerName;
      const bname = b.centerName;

      if (aname) {
        if (bname) {
          return aname.localeCompare(bname);
        } else {
          return -1;
        }
      } else {
        if (bname) {
          return 1;
        } else {
          return 0;
        }
      }
    });

    let sheet = XLSX.utils.json_to_sheet(sheetData);

    // --- fix header names
    let headers = [
      "Cohorte",
      "ID",
      "Date de dernière modification",
      "Région des volontaires",
      "Département des volontaires",
      "Nombre de volontaires",
      "ID centre",
      "Désignation du centre",
      "Département du centre",
      "Région du centre",
    ];
    for (let i = 1; i <= maxGatheringPlaces; ++i) {
      headers.push(...["ID du point de rassemblement " + i, "Désignation du point de rassemblement " + i]);
    }
    XLSX.utils.sheet_add_aoa(sheet, [headers], { origin: "A1" });

    // --- create workbook
    let workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, sheet, "Schéma de répartition");
    const fileName = "schema-repartition.xlsx";
    // const workbook = { Sheets: { data: sheet }, SheetNames: ["Schema de repartition"] };
    return { workbook, fileName };
  }

  const getSchemaRepartitionRoute = () => {
    if ([ROLES.ADMIN, ROLES.TRANSPORTER].includes(user.role)) {
      return `/schema-repartition?cohort=${cohort.name}`;
    }
    if (region && user.role === ROLES.REFERENT_REGION) {
      return `/schema-repartition/${region}?cohort=${cohort.name}`;
    }
  };

  const handleChangeCohort = (cohortName) => {
    setCohort(cohortName);
    history.replace({ pathname: location.pathname, search: `?cohort=${cohortName}` });
  };

  const handleChangeDepartment = (value) => {
    history.push(`/schema-repartition/${department2region[value]}/${value}?cohort=${cohort.name}`);
  };

  if (!cohort) return <Loading />;

  return (
    <div>
      <Breadcrumbs items={[{ label: "Schéma de répartition", to: getSchemaRepartitionRoute() }]} />
      <div className="p-[30px]">
        <div className="flex items-center justify-between">
          <PlanTransportBreadcrumb
            region={region ? { label: region } : null}
            department={department ? { label: department } : null}
            onGoToNational={goToNational}
            onGoToRegion={goToRegion}
          />
          {filteredCohortList.length > 0 && (
            <div className="flex gap-4">
              {user.role === ROLES.REFERENT_DEPARTMENT && user.department.length > 1 && <Select options={departementsList} value={department} onChange={handleChangeDepartment} />}
              <SelectCohort cohort={cohort.name} onChange={handleChangeCohort} sort="dateStart" filterFn={(c) => filteredCohortList.find(({ name }) => name === c.name)} />
            </div>
          )}
        </div>
        {filteredCohortList.length === 0 ? (
          <div className="flex justify-center items-center mt-[120px]">
            <div className="text-gray-900 flex flex-col items-center">
              <Puzzle />
              <div className="text-2xl font-bold text-center mb-8 mt-9">Ooops...</div>
              <div className="text-xl text-center">Aucun schéma de répartition n’est disponible pour le moment.</div>
            </div>
          </div>
        ) : (
          <>
            <div className="my-[40px] flex">
              <div className="flex grow flex-col">
                <BoxVolontaires className="mb-[8px] grow" summary={summary} loading={loading} />
                <BoxAffectation className="mt-[8px] grow" summary={summary} loading={loading} />
              </div>
              <BoxDisponibilite className="mx-[16px] grow" summary={summary} loading={loading} isNational={isNational} />
              <BoxCentres className="grow" summary={summary} loading={loading} isDepartmental={isDepartmental} user={user} />
            </div>
            {isDepartmental ? (
              <>
                <SchemaEditor
                  onExportDetail={handleExportDetail}
                  region={region}
                  department={department}
                  cohort={cohort}
                  groups={data && data.groups ? data.groups : { intra: [], extra: [] }}
                  summary={summary}
                  onChange={loadSchemaData}
                  user={user}
                />
                <SchemaDepartmentDetail department={department} cohort={cohort} departmentData={data} />
              </>
            ) : (
              <DetailTable rows={data.rows} loading={loading} isNational={isNational} onGoToRow={goToRow} onExportDetail={handleExportDetail} cohort={cohort} user={user} />
            )}
          </>
        )}
      </div>
    </div>
  );
}
