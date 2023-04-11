import React from "react";
import { toastr } from "react-redux-toastr";
import { ES_NO_LIMIT, getDepartmentNumber, region2department } from "snu-lib";
import Profil from "../../../../assets/icons/Profil";
import { capture } from "../../../../sentry";
import API from "../../../../services/api";
import { Loading } from "../../components/commons";
import { BsChevronDown, BsChevronUp } from "react-icons/bs";
import ButtonPrimary from "../../../../components/ui/buttons/ButtonPrimary";
import * as XLSX from "xlsx";
import * as FileSaver from "file-saver";

const ExcelFileType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";

export function InTable({ region, cohort }) {
  const [loadingQuery, setLoadingQuery] = React.useState(false);
  const [data, setData] = React.useState([]);
  const [centerTotal, setCenterTotal] = React.useState(0);
  const [placesTotal, setPlacesTotal] = React.useState(0);
  const [searchDepartment, setSearchDepartment] = React.useState("");
  const [departments, setDepartments] = React.useState(region2department[region]);
  const [objectifByDepartment, setObjectifByDepartment] = React.useState([]);
  const [youngsByDepartment, setYoungsByDepartment] = React.useState([]);

  React.useEffect(() => {
    (async () => {
      try {
        setLoadingQuery(true);
        const { data, ok } = await API.get(`/table-de-repartition/toRegion/${cohort}/${region}`);
        if (!ok) return toastr.error("Oups, une erreur est survenue lors de la récupération des données");
        setData(data);

        //Get all region wich came tp the region
        const filteredData = data.filter((e, i) => {
          return i === data.findIndex((a) => a.fromRegion === e.fromRegion && a.toRegion === e.toRegion);
        });
        const inRegion = filteredData.map((e) => e.fromRegion);

        const bodyYoung = {
          query: {
            bool: {
              must: { match_all: {} },
              filter: [{ term: { "cohort.keyword": cohort } }, { terms: { "status.keyword": ["VALIDATED"] } }, { terms: { "region.keyword": inRegion } }],
            },
          },
          aggs: {
            department: { terms: { field: "department.keyword" } },
          },
          track_total_hits: true,
          size: 0,
        };

        const { responses } = await API.esQuery("young", bodyYoung);
        setYoungsByDepartment(responses[0].aggregations.department.buckets);

        const bodyCohesionCenter = {
          query: { bool: { must: { match_all: {} }, filter: [{ terms: { "cohorts.keyword": [cohort] } }, { term: { "region.keyword": region } }] } },
          track_total_hits: true,
          size: ES_NO_LIMIT,
        };

        const { responses: responsesCenter } = await API.esQuery("cohesioncenter", bodyCohesionCenter);
        const centerDetail = responsesCenter[0].hits.hits.map((e) => new Object({ ...e._source, _id: e._id }));
        setCenterTotal(centerDetail.length);

        const bodySession = {
          query: { bool: { must: { match_all: {} }, filter: [{ terms: { "cohesionCenterId.keyword": centerDetail.map((c) => c._id) } }, { term: { "cohort.keyword": cohort } }] } },
          track_total_hits: true,
          size: ES_NO_LIMIT,
        };

        const { responses: responsesSession } = await API.esQuery("sessionphase1", bodySession);
        const sessionsDetail = responsesSession[0].hits.hits.map((e) => e._source);

        const placesSessionTotal = sessionsDetail.reduce((acc, session) => {
          acc += session.placesTotal;
          return acc;
        }, 0);

        setPlacesTotal(placesSessionTotal);

        const { data: dataObjectif, ok: okObjectif } = await API.get(`/inscription-goal/${cohort}`);
        if (!okObjectif) return toastr.error("Oups, une erreur est survenue lors de la récupération des données");
        setObjectifByDepartment(dataObjectif.filter((e) => inRegion.includes(e.region)));

        setLoadingQuery(false);
      } catch (e) {
        capture(e);
        toastr.error("Oups, une erreur est survenue lors de la récupération des données");
      }
    })();
  }, [cohort]);

  React.useEffect(() => {
    let departments = region2department[region].filter((e) => {
      if (searchDepartment === "") return true;
      return e.toLowerCase().includes(searchDepartment.toLowerCase());
    });
    setDepartments(departments);
  }, [searchDepartment]);

  async function loadExportData() {
    let url = `/table-de-repartition/toRegion/${cohort}/${region}`;
    const result = await API.get(url);
    if (!result.ok) {
      return toastr.error("Oups, une erreur est survenue lors de la récupération des données");
    }
    //Get all region wich came tp the region
    const filteredData = data.filter((e, i) => {
      return i === data.findIndex((a) => a.fromRegion === e.fromRegion && a.toRegion === e.toRegion);
    });
    const inRegion = filteredData.map((e) => e.fromRegion);

    const { data: dataObjectif, ok: okObjectif } = await API.get(`/inscription-goal/${cohort}`);
    if (!okObjectif) return toastr.error("Oups, une erreur est survenue lors de la récupération des données");
    const goals = dataObjectif.filter((e) => inRegion.includes(e.region));

    return result.data
      .map((element) => ({
        ...element,
        goal: goals.find((e) => element.fromDepartment === e.department)?.max || 0,
        youngs: youngsByDepartment.find((r) => r.key === element.fromDepartment)?.doc_count || 0,
      }))
      .filter((e) => region2department[region].includes(e.toDepartment));
  }

  async function exportExcelSheet(departments) {
    let sheetData = departments.map((dept) => ({
      toDepartmentNumber: getDepartmentNumber(dept.toDepartment),
      toDepartment: dept.toDepartment,
      fromRegion: dept.fromRegion,
      formDepartmentNumber: getDepartmentNumber(dept.fromDepartment),
      fromDepartment: dept.fromDepartment,
      youngs: dept.youngs,
      rate: `${dept.goal !== 0 ? Math.round((dept.youngs / dept.goal) * 100) : 100} %`,
      goal: dept.goal,
    }));

    let sheet = XLSX.utils.json_to_sheet(sheetData);

    // --- fix header names
    let headers = [
      "N° de département d'accueil",
      "Département d'accueil",
      "Région de départ",
      "N° de département de départ",
      "Département de départ",
      "Nombre d'inscrits sur liste principale dans la région de départ",
      "Taux d'inscriptions",
      "Objectif d'inscriptions dans la région de départ",
    ];
    XLSX.utils.sheet_add_aoa(sheet, [headers], { origin: "A1" });

    // --- create workbook
    let workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, sheet, "Schéma de répartition");
    const fileName = "schema-repartition.xlsx";
    return { workbook, fileName };
  }

  const handleExportData = async () => {
    try {
      const data = await loadExportData();
      const result = await exportExcelSheet(data);
      const buffer = XLSX.write(result.workbook, { bookType: "xlsx", type: "array" });
      FileSaver.saveAs(new Blob([buffer], { type: ExcelFileType }), result.fileName);
    } catch (e) {
      capture(e);
      toastr.error("Oups, une erreur est survenue lors de la récupération des données. Nous ne pouvons exporter les données.");
    }
  };

  return (
    <>
      {/* INFO */}
      <div className="flex flex-col gap-4 w-4/12 pb-6">
        <div className="flex flex-col gap-3 bg-white rounded-lg shadow-sm p-4">
          <div className="text-sm text-gray-800 font-bold leading-5">Centres en {region}</div>
          <div className="flex items-center gap-3 ">
            <div className="text-2xl text-gray-800 font-bold leading-7">{centerTotal}</div>
            <div className="text-xs text-[#0063CB] leading-5 font-bold px-1 bg-[#E8EDFF] rounded-lg uppercase">{placesTotal} Places</div>
          </div>
        </div>
      </div>
      {/* TABLE */}
      <div className="flex flex-col gap-2 rounded-lg bg-white pb-3">
        <div className="flex px-4 py-3 items-center justify-between w-full">
          <input
            type="text"
            name="search"
            className=" border border-gray-300 rounded-lg px-4 py-2 w-1/3"
            placeholder="Rechercher un département"
            onChange={(e) => setSearchDepartment(e.target.value)}
          />
          <ButtonPrimary onClick={handleExportData}>Exporter</ButtonPrimary>
        </div>
        <hr />
        <div className="flex px-4 py-2 items-center">
          <div className="w-[30%] uppercase text-[#7E858C] text-xs leading-3">Départements d&apos;accueil</div>
          <div className="w-[70%] uppercase text-[#7E858C] text-xs leading-3">Régions accueillies</div>
        </div>
        {departments?.length ? (
          departments.map((department) => {
            return (
              <Department
                key={"reverse" + department}
                department={department}
                data={data}
                loadingQuery={loadingQuery}
                objectifByDepartment={objectifByDepartment}
                youngsByDepartment={youngsByDepartment}
              />
            );
          })
        ) : (
          <>
            <hr />
            <div className="flex px-4 pb-4 pt-2 items-center justify-center w-full">
              <div className="text-sm text-[#7E858C] leading-6">Aucun département ne correspond à votre recherche</div>
            </div>
          </>
        )}
      </div>
    </>
  );
}

const Department = ({ department, loadingQuery, data, objectifByDepartment, youngsByDepartment }) => {
  const [open, setOpen] = React.useState({ open: false, region: null });
  const [listRegion, setListRegion] = React.useState([]);
  const [departmentByRegion, setDepartmentByRegion] = React.useState([]);

  React.useEffect(() => {
    const assignRegion = data.filter((e) => e.toDepartment === department) || [];
    const assignRegionUnique = assignRegion.filter((thing, index, self) => index === self.findIndex((t) => t.fromRegion === thing.fromRegion));
    setListRegion(assignRegionUnique);

    const departmentByRegion = assignRegion.reduce((acc, cur) => {
      if (!acc[cur.fromRegion]) acc[cur.fromRegion] = [];
      acc[cur.fromRegion].push(cur.fromDepartment);
      return acc;
    }, {});
    setDepartmentByRegion(departmentByRegion);
  }, [data]);

  return (
    <>
      <hr />
      <div className="flex px-4 py-2 items-center">
        <div className="w-[30%]">
          <div className="text-base text-[#242526] font-bold leading-6">{department}</div>
        </div>
        <div className="w-[70%]">
          {loadingQuery ? (
            <Loading width="w-1/3" />
          ) : (
            <div className="relative flex flex-row gap-2 items-center flex-wrap">
              {listRegion.map((assign, i) => (
                <div key={i + "assignRegion"}>
                  <div
                    className="relative text-xs text-gray-700 bg-gray-100 rounded-full p-2 cursor-pointer hover:scale-105 flex gap-2 items-center"
                    onClick={() => setOpen({ open: true, region: assign.fromRegion })}>
                    {assign.fromRegion} {open.open ? <BsChevronUp /> : <BsChevronDown />}
                  </div>
                  {open.open && open.region === assign.fromRegion && (
                    <InfoDepartment
                      region={assign.fromRegion}
                      setOpen={setOpen}
                      assignDepartment={departmentByRegion[assign.fromRegion]}
                      objectifByDepartment={objectifByDepartment}
                      youngsByDepartment={youngsByDepartment}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

const InfoDepartment = ({ setOpen, assignDepartment, region, objectifByDepartment, youngsByDepartment }) => {
  const ref = React.useRef(null);

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen({ open: false, region: null });
      }
    };
    document.addEventListener("click", handleClickOutside, true);
    return () => {
      document.removeEventListener("click", handleClickOutside, true);
    };
  }, []);

  return (
    <div ref={ref} className="absolute z-50 flex flex-col bg-white top-[110%] left-[0px] shadow-ninaButton rounded-lg min-w-[400px] py-2 max-h-60 overflow-y-auto">
      <div className="flex flex-col">
        <div className="flex gap-4 p-2">
          <div className="text-gray-500 text-xs font-medium leading-4 basis-3/6">{region}</div>
          <div className="text-gray-500 text-xs font-medium leading-4 basis-1/6">Objectif</div>
          <div className="text-gray-500 text-xs font-medium leading-4 basis-2/6">Inscrits</div>
        </div>
        {assignDepartment.map((assign, i) => {
          const goal = objectifByDepartment.find((e) => e.department === assign) ? objectifByDepartment.find((e) => e.department === assign).max || 0 : 0;
          const youngsInDepartment = youngsByDepartment.find((r) => r.key === assign)?.doc_count || 0;
          return (
            <div key={i + "assignDepartment"} className="flex gap-4 justify-between relative hover:bg-gray-100 cursor-default p-2">
              <div className="text-sm leading-5 text-gray-700 basis-3/6">
                {getDepartmentNumber(assign)} - {assign}
              </div>
              <div className="flex items-center gap-2 basis-1/6">
                <Profil className="text-gray-400" />
                <div className="text-sm leading-5 text-gray-500 font-normal">{goal}</div>
              </div>
              <div className="flex items-center gap-2 basis-2/6">
                <Profil className="text-gray-400" />
                <div className="text-sm leading-5 text-gray-500 font-normal flex gap-2 flex-grow">
                  <span>{youngsInDepartment}</span>
                  <span className="text-gray-400">({goal !== 0 ? Math.round((youngsInDepartment / goal) * 100) : 100} %)</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
