import React, { useEffect, useState } from "react";
import Breadcrumbs from "../../../components/Breadcrumbs";
import PlanTransportBreadcrumb from "../components/PlanTransportBreadcrumb";
import { Box, BoxHeader, MiniTitle, Badge, AlertPoint, BigDigits, Loading, regionList } from "../components/commons";
import { Link, useHistory, useLocation } from "react-router-dom";
import ChevronRight from "../../../assets/icons/ChevronRight";
import { formatRate, parseQuery } from "../util";
import ExternalLink from "../../../assets/icons/ExternalLink";
import People from "../../../assets/icons/People";
import ProgressBar from "../components/ProgressBar";
import ProgressArc from "../components/ProgressArc";
import Select from "../components/Select";
import FrenchMap from "../../../assets/icons/FrenchMap";
import { capture } from "../../../sentry";
import { toastr } from "react-redux-toastr";
import API from "../../../services/api";
import { department2region, getDepartmentNumber, region2department, ROLES } from "snu-lib";
import SchemaEditor from "./SchemaEditor";
import SchemaDepartmentDetail from "./SchemaDepartmentDetail";
import * as XLSX from "xlsx";
import * as FileSaver from "file-saver";
import { useSelector } from "react-redux";
import ButtonPrimary from "../../../components/ui/buttons/ButtonPrimary";
import { getCohortByName } from "../../../services/cohort.service";
import ReactTooltip from "react-tooltip";
import useDocumentTitle from "../../../hooks/useDocumentTitle";
import Puzzle from "../../../assets/icons/Puzzle";
import dayjs from "@/utils/dayjs.utils";

const ExcelFileType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";

export default function SchemaRepartition({ region, department }) {
  const history = useHistory();
  const location = useLocation();
  const { user } = useSelector((state) => state.Auth);
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
  const cohortList = useSelector((state) => state.Cohorts);
  const [cohortOptions, setCohortOptions] = useState([]);

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

  function getDefaultCohort() {
    const { cohort } = parseQuery(location.search);
    if (cohort && cohortList && cohortOptions.find((c) => c.value === cohort)) {
      return cohort;
    } else {
      return cohortOptions && cohortOptions.length > 0 ? cohortOptions[0].value : null;
    }
  }

  useEffect(() => {
    if (cohortList !== null) {
      setCohortOptions(
        cohortList
          .filter((c) => {
            return (
              [ROLES.ADMIN, ROLES.TRANSPORTER].includes(user.role) ||
              (user.role === ROLES.REFERENT_DEPARTMENT && c.schemaAccessForReferentDepartment) ||
              (user.role === ROLES.REFERENT_REGION && c.schemaAccessForReferentRegion)
            );
          })
          .sort((a, b) => new Date(b.dateStart) - new Date(a.dateStart))
          .map((c) => ({ value: c.name, label: formatCohortName(c) })),
      );
    } else {
      setCohortOptions([]);
    }
  }, [cohortList]);

  useEffect(() => {
    setCohort(getDefaultCohort());
  }, [cohortOptions]);

  useEffect(() => {
    if (cohort) {
      loadData();
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

  function formatCohortName(cohort) {
    let from;

    if (cohort) {
      const start = dayjs(cohort.dateStart);
      const end = dayjs(cohort.dateEnd);

      if (start.year() === end.year()) {
        if (start.month() === end.month()) {
          from = start.format("Do");
        } else {
          from = start.format("Do MMMM");
        }
      } else {
        from = start.format("Do MMMM YYYY");
      }
      const to = end.format("Do MMMM YYYY");
      return `${cohort.name} (du ${from} au ${to})`;
    } else {
      return "";
    }
  }
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

  async function loadData() {
    try {
      setLoading(true);
      let url = "/schema-de-repartition";
      if (region) {
        url += "/" + region;
      }
      if (department) {
        url += "/" + department;
      }
      const { data, ok } = await API.get(url + "/" + cohort);
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
      history.push("/schema-repartition?cohort=" + cohort);
    }
    // if (region && user.role === ROLES.REFERENT_REGION) {
    //   history.push(`/schema-repartition/${region}?cohort=${cohort}`);
    // }
  }

  function goToRegion() {
    if (region && user.role !== ROLES.REFERENT_DEPARTMENT) {
      history.push(`/schema-repartition/${region}?cohort=${cohort}`);
    }
  }

  // function goToDepartment() {
  //   if (region && department) {
  //     history.push(`/schema-repartition/${region}/${department}?cohort=${cohort}`);
  //   }
  // }

  function goToRow(row) {
    if (region) {
      history.push(`/schema-repartition/${region}/${row.name}?cohort=${cohort}`);
    } else {
      history.push(`/schema-repartition/${row.name}?cohort=${cohort}`);
    }
  }

  async function exportDetail() {
    try {
      const groups = await loadExportData();
      const result = await exportExcelSheet(groups);
      const buffer = XLSX.write(result.workbook, { bookType: "xlsx", type: "array" });
      FileSaver.saveAs(new Blob([buffer], { type: ExcelFileType }), result.fileName);
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
      return `/schema-repartition?cohort=${cohort}`;
    }
    if (region && user.role === ROLES.REFERENT_REGION) {
      return `/schema-repartition/${region}?cohort=${cohort}`;
    }
  };

  const handleChangeCohort = (value) => {
    setCohort(value);
    history.replace({ pathname: location.pathname, search: `?cohort=${value}` });
  };

  const handleChangeDepartment = (value) => {
    history.push(`/schema-repartition/${department2region[value]}/${value}?cohort=${cohort}`);
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
          {cohortOptions.length > 0 && (
            <div className="flex gap-4">
              {user.role === ROLES.REFERENT_DEPARTMENT && user.department.length > 1 && <Select options={departementsList} value={department} onChange={handleChangeDepartment} />}
              <Select options={cohortOptions} value={cohort} onChange={handleChangeCohort} />
            </div>
          )}
        </div>
        {cohortOptions.length === 0 ? (
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
                  onExportDetail={exportDetail}
                  region={region}
                  department={department}
                  cohort={cohort}
                  groups={data && data.groups ? data.groups : { intra: [], extra: [] }}
                  summary={summary}
                  onChange={loadData}
                  user={user}
                />
                <SchemaDepartmentDetail department={department} cohort={cohort} departmentData={data} />
              </>
            ) : (
              <DetailTable rows={data.rows} loading={loading} isNational={isNational} onGoToRow={goToRow} onExportDetail={exportDetail} cohort={cohort} user={user} />
            )}
          </>
        )}
      </div>
    </div>
  );
}

function BoxVolontaires({ summary, className = "", loading }) {
  return (
    <Box>
      <div className={`mb-[10px] flex items-center ${className}`}>
        <MiniTitle>Volontaires</MiniTitle>
        {!loading && summary.intradepartmental > 0 && (
          <>
            <Badge className="mx-[8px]">{formatRate(summary.assigned, summary.total)} affectés</Badge>
            <Link to="">
              <ExternalLink className="hover:text[#000000] text-[#9CA3AF]" />
            </Link>
          </>
        )}
      </div>
      {loading ? (
        <Loading />
      ) : (
        <div className="flex items-center">
          <People className="text-[#9CA3AF]" />
          <BigDigits className="mx-[8px]">{summary.total}</BigDigits>
          {summary.intradepartmental > 0 ? (
            <div className="">dont {summary.intradepartmental} intra-départemental</div>
          ) : (
            <Badge>{formatRate(summary.assigned, summary.total)} affectés</Badge>
          )}
        </div>
      )}
    </Box>
  );
}

function BoxAffectation({ summary, className = "", loading }) {
  return (
    <Box className={className}>
      <MiniTitle className="mb-[10px]">Affectation des volontaires</MiniTitle>
      {loading ? (
        <Loading />
      ) : (
        <>
          <ProgressBar total={summary.total} value={summary.assigned} className="my-[10px]" />
          <div className="flex items-center">
            <div className="mr-[16px] flex items-center text-[12px] leading-[14px] text-[#1F2937]">
              <div className="h-[7px] w-[7px] rounded-[100px] bg-[#303958]" />
              <b className="mx-[5px]">{summary.assigned}</b>
              affectés
            </div>
            <div className="mr-[16px] flex items-center text-[12px] leading-[14px] text-[#1F2937]">
              <div className="h-[7px] w-[7px] rounded-[100px] bg-[#E5E7EB]" />
              <b className="mx-[5px]">{Math.max(0, summary.total - summary.assigned)}</b>
              <span>restants</span>
            </div>
          </div>
        </>
      )}
    </Box>
  );
}

function BoxDisponibilite({ summary, className = "", loading, isNational }) {
  return (
    <Box className={`flex-column flex justify-between pb-[0px] ${className}`}>
      <div>
        <MiniTitle className="mb-[10px]">Disponibilité des places</MiniTitle>
        {loading ? (
          <Loading />
        ) : (
          <>
            {!isNational && summary.toRegions && <div className="mb-[10px] text-[13px] leading-[1.3em] text-[#6B7280]">{summary.toRegions.map((r) => r.name).join(", ")}</div>}
            <div className="flex">
              <Badge className="">{summary.capacity} places</Badge>
            </div>
          </>
        )}
      </div>
      <div className="mt-[30px] h-[130px]">
        {loading ? (
          <Loading />
        ) : (
          <ProgressArc total={summary.capacity} value={summary.assigned} legend="Places libres" hilight={Math.max(0, summary.capacity - summary.assigned)} />
        )}
      </div>
    </Box>
  );
}

function BoxCentres({ summary, className = "", loading, isNational, isDepartmental, user }) {
  return (
    <Box className={`overflow-hidden ${className}`}>
      <FrenchMap className="absolute right-[-40px] top-[30px] z-[0]" />
      <MiniTitle className="mb-[10px] flex items-center">
        {isDepartmental ? (
          <>
            <span className="mr-[8px]">Régions d&apos;accueil</span>
            {loading ? <Loading width="w-1/3" /> : <Badge>{summary.centers} CENTRES</Badge>}
          </>
        ) : (
          "Centres"
        )}
      </MiniTitle>
      {!isDepartmental && <>{loading ? <Loading width="w-1/3" /> : <BigDigits>{summary.centers}</BigDigits>}</>}
      {!isNational && loading ? (
        <Loading width="w-1/3" />
      ) : (
        <ul className="mb-6 list-none">
          {summary.toRegions.map((region) => (
            <React.Fragment key={region.name}>
              <li className="mt-[12px] text-[15px] font-bold leading-[18px] text-[#171725]">{region.name}</li>
              {isDepartmental && (
                <li className="text-[12px], mt-[2px] leading-[14px] text-[#1F2937]">
                  {region.departments.map((department) => `${department} (${getDepartmentNumber(department)})`).join(", ")}
                </li>
              )}
            </React.Fragment>
          ))}
        </ul>
      )}
      {user.role !== ROLES.TRANSPORTER && (
        <Link to="/table-repartition" className="absolute right-[20px] bottom-[14px] flex items-center text-[12px] text-[#2563EB] hover:text-[#000000]">
          Table de répartition <ChevronRight className="ml-[5px]" />
        </Link>
      )}
    </Box>
  );
}

function DetailTable({ rows, className = "", loading, isNational, onGoToRow, onExportDetail, cohort: cohortName, user }) {
  const [isUserAuthorizedToExportData, setIsUserAuthorizedToExportData] = useState(false);

  function goToRow(row) {
    onGoToRow && onGoToRow(row);
  }

  const checkIfUserIsAuthorizedToExportData = async () => {
    const { data: cohort } = await getCohortByName(cohortName);
    if ((!cohort || !cohort.repartitionSchemaDownloadAvailability) && user.role === ROLES.TRANSPORTER) {
      setIsUserAuthorizedToExportData(false);
      return;
    }
    setIsUserAuthorizedToExportData(true);
  };

  useEffect(() => {
    checkIfUserIsAuthorizedToExportData();
  }, [cohortName]);

  return (
    <Box className={className}>
      <BoxHeader title="">
        <span data-tip data-tip-disable={false} data-for="export-data">
          <ButtonPrimary onClick={onExportDetail} disabled={!isUserAuthorizedToExportData}>
            Exporter
          </ButtonPrimary>
          <ReactTooltip
            disable={isUserAuthorizedToExportData}
            id="export-data"
            type="light"
            place="top"
            effect="solid"
            className="custom-tooltip-radius !opacity-100 !shadow-md"
            tooltipRadius="6">
            <p className=" w-[275px] list-outside !px-2 !py-1.5 text-left text-xs text-gray-600">
              L&apos;export n&apos;est pas disponible au téléchargement. Contactez-nous pour plus d&apos;information
            </p>
          </ReactTooltip>
        </span>
      </BoxHeader>
      <div className="">
        <table className="w-[100%]">
          <thead className="text-[11px] uppercase leading-[16px] text-[#7E858C]">
            <tr className="border-b-[1px] border-b-[#F4F5FA]">
              <th className="py-[17px] pr-[16px] font-medium">{isNational ? "Régions" : "Départements"}</th>
              <th className="py-[17px] pr-[16px] font-medium">Volontaires</th>
              <th className="py-[17px] pr-[16px] font-medium">Places restantes</th>
              <th className="py-[17px] pr-[16px] font-medium">Volontaires en intra-départemental</th>
              <th className="py-[17px] font-medium">Places restantes dans le département</th>
            </tr>
          </thead>
          <tbody className="text-[14px] font-medium leading-[16px] text-[#1F2937]">
            {rows.map((row) => (
              <tr key={row.name} className="border-b-[1px] border-b-[#F4F5FA] hover:bg-[#F2F5FC]" onClick={() => goToRow(row)}>
                <td className="whitespace-nowrap py-[17px] px-[9px] text-[15px] font-bold text-[#242526]">
                  {row.name} {!isNational ? `(${getDepartmentNumber(row.name)})` : null}
                </td>
                <td className="py-[17px] px-[8px]">
                  {loading ? (
                    <Loading />
                  ) : (
                    <div className="flex items-center">
                      <div className="mr-[8px]">{row.total}</div>
                      <Badge className="">{formatRate(row.assigned, row.total)} affectés</Badge>
                    </div>
                  )}
                </td>
                <td className="py-[17px] px-[8px]">
                  {loading ? (
                    <Loading />
                  ) : (
                    <div className="flex items-center">
                      <AlertPoint threshold={50} value={row.capacity - row.assigned} />
                      <span>{Math.max(0, row.capacity - row.assigned)}</span>
                    </div>
                  )}
                </td>
                <td className="py-[17px] px-[8px]">
                  {loading ? (
                    <Loading />
                  ) : (
                    <div className="flex items-center">
                      <div className="">{row.intradepartmental}</div>
                      {row.intradepartmental > 0 && (
                        <Badge mode={row.intradepartmentalAssigned === row.intradepartmental ? "green" : "blue"} className="ml-2">
                          {formatRate(row.intradepartmentalAssigned, row.intradepartmental)} affectés
                        </Badge>
                      )}
                      {user.role !== ROLES.TRANSPORTER && (
                        <Link
                          to={getIntradepartmentalYoungsLink(isNational ? row.name : null, isNational ? null : row.name, cohortName)}
                          className="ml-2"
                          onClick={(e) => {
                            e.stopPropagation();
                          }}>
                          <ExternalLink className="text-[#9CA3AF]" />
                        </Link>
                      )}
                    </div>
                  )}
                </td>
                <td className="py-[17px] px-[8px]">
                  {loading ? (
                    <Loading />
                  ) : (
                    <div className="flex items-center">
                      <AlertPoint threshold={0} value={row.intraCapacity - row.intradepartmentalAssigned} />
                      {Math.max(0, row.intraCapacity - row.intradepartmentalAssigned)}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Box>
  );
}

function getIntradepartmentalYoungsLink(region, department, cohort) {
  let url =
    "/volontaire?STATUS=" + encodeURIComponent('["VALIDATED"]') + "&COHORT=" + encodeURIComponent('["' + cohort + '"]') + "&SAME_DEPARTMENT=" + encodeURIComponent('["true"]');

  if (department) {
    url += "&DEPARTMENT=" + encodeURIComponent('["' + department + '"]');
  } else if (region) {
    url += "&REGION=" + encodeURIComponent('["' + region + '"]');
  }

  return url;
}
