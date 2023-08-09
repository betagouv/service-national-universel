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

        const response = await API.post("/elasticsearch/young/search", {
          filters: { cohort: [cohort], status: ["VALIDATED"], region: inRegion },
        });
        if (!response.responses.length) return toastr.error("Oups, une erreur est survenue lors de la récupération des volontaires");
        setYoungsByDepartment(response.responses[1].aggregations.department.names.buckets);

        const { ok: res, data: centers } = await API.post("/elasticsearch/cohesioncenter/export?needSessionPhase1Info=true", {
          filters: { cohorts: [cohort], region: [region] },
        });
        if (!res) return toastr.error("Oups, une erreur est survenue lors de la récupération des centres");
        setCenterTotal(centers.length);

        const placesSessionTotal = centers.reduce((acc, item) => {
          const cohortSessions = item.sessionsPhase1.filter((session) => session.cohort === cohort);
          const cohortPlacesTotal = cohortSessions.reduce((total, session) => total + session.placesTotal, 0);
          return acc + cohortPlacesTotal;
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
      <div className="flex w-4/12 flex-col gap-4 pb-6">
        <div className="flex flex-col gap-3 rounded-lg bg-white p-4 shadow-sm">
          <div className="text-sm font-bold leading-5 text-gray-800">Centres en {region}</div>
          <div className="flex items-center gap-3 ">
            <div className="text-2xl font-bold leading-7 text-gray-800">{centerTotal}</div>
            <div className="rounded-lg bg-[#E8EDFF] px-1 text-xs font-bold uppercase leading-5 text-[#0063CB]">{placesTotal} Places</div>
          </div>
        </div>
      </div>
      {/* TABLE */}
      <div className="flex flex-col gap-2 rounded-lg bg-white pb-3">
        <div className="flex w-full items-center justify-between px-4 py-3">
          <input
            type="text"
            name="search"
            className=" w-1/3 rounded-lg border border-gray-300 px-4 py-2"
            placeholder="Rechercher un département"
            onChange={(e) => setSearchDepartment(e.target.value)}
          />
          <ButtonPrimary onClick={handleExportData}>Exporter</ButtonPrimary>
        </div>
        <hr />
        <div className="flex items-center px-4 py-2">
          <div className="w-[30%] text-xs uppercase leading-3 text-[#7E858C]">Départements d&apos;accueil</div>
          <div className="w-[70%] text-xs uppercase leading-3 text-[#7E858C]">Régions accueillies</div>
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
            <div className="flex w-full items-center justify-center px-4 pb-4 pt-2">
              <div className="text-sm leading-6 text-[#7E858C]">Aucun département ne correspond à votre recherche</div>
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
      <div className="flex items-center px-4 py-2">
        <div className="w-[30%]">
          <div className="text-base font-bold leading-6 text-[#242526]">{department}</div>
        </div>
        <div className="w-[70%]">
          {loadingQuery ? (
            <Loading width="w-1/3" />
          ) : (
            <div className="relative flex flex-row flex-wrap items-center gap-2">
              {listRegion.map((assign, i) => (
                <div key={i + "assignRegion"}>
                  <div
                    className="relative flex cursor-pointer items-center gap-2 rounded-full bg-gray-100 p-2 text-xs text-gray-700 hover:scale-105"
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
    <div ref={ref} className="max-h-60 absolute top-[110%] left-[0px] z-50 flex min-w-[400px] flex-col overflow-y-auto rounded-lg bg-white py-2 shadow-ninaButton">
      <div className="flex flex-col">
        <div className="flex gap-4 p-2">
          <div className="basis-3/6 text-xs font-medium leading-4 text-gray-500">{region}</div>
          <div className="basis-1/6 text-xs font-medium leading-4 text-gray-500">Objectif</div>
          <div className="basis-2/6 text-xs font-medium leading-4 text-gray-500">Inscrits</div>
        </div>
        {assignDepartment.map((assign, i) => {
          const goal = objectifByDepartment.find((e) => e.department === assign) ? objectifByDepartment.find((e) => e.department === assign).max || 0 : 0;
          const youngsInDepartment = youngsByDepartment.find((r) => r.key === assign)?.doc_count || 0;
          return (
            <div key={i + "assignDepartment"} className="relative flex cursor-default justify-between gap-4 p-2 hover:bg-gray-100">
              <div className="basis-3/6 text-sm leading-5 text-gray-700">
                {getDepartmentNumber(assign)} - {assign}
              </div>
              <div className="flex basis-1/6 items-center gap-2">
                <Profil className="text-gray-400" />
                <div className="text-sm font-normal leading-5 text-gray-500">{goal}</div>
              </div>
              <div className="flex basis-2/6 items-center gap-2">
                <Profil className="text-gray-400" />
                <div className="flex flex-grow gap-2 text-sm font-normal leading-5 text-gray-500">
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
