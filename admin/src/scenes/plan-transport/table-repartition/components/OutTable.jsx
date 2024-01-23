import React from "react";
import { region2department, ROLES, department2region, ES_NO_LIMIT, getDepartmentNumber } from "snu-lib";
import Pencil from "../../../../assets/icons/Pencil";
import { Loading } from "../../components/commons";

import { BsChevronRight } from "react-icons/bs";
import { toastr } from "react-redux-toastr";
import { useHistory } from "react-router-dom";
import FrenchMap from "../../../../assets/icons/FrenchMap";
import Profil from "../../../../assets/icons/Profil";
import { capture } from "../../../../sentry";
import API from "../../../../services/api";

export function OutTable({ cohort, region, user }) {
  const history = useHistory();
  const [loadingQuery, setLoadingQuery] = React.useState(false);

  //info
  const [youngsTotal, setYoungsTotal] = React.useState(0);
  const [centerTotal, setCenterTotal] = React.useState(0);
  const [regionAccueil, setRegionAccueil] = React.useState([]);
  const [avancement, setAvancement] = React.useState(0);

  //process
  const [data, setData] = React.useState([]);
  const [youngsByDepartment, setYoungsByDepartment] = React.useState([]);
  const [placesCenterByDepartment, setPlacesCenterByDepartment] = React.useState({});
  const [searchDepartment, setSearchDepartment] = React.useState("");
  const [departments, setDepartments] = React.useState(region2department[region]);

  const getRepartitionDepartment = async () => {
    try {
      const { data, ok } = await API.get(`/table-de-repartition/fromRegion/${cohort}/${region}`);
      if (!ok) return toastr.error("Oups, une erreur est survenue lors de la récupération des données");
      setData(data);
      const filteredData = data.filter((e, i) => {
        return i === data.findIndex((a) => a.fromRegion === e.fromRegion && a.toRegion === e.toRegion);
      });
      const regionAccueil = filteredData.map((e) => e.toRegion);
      setRegionAccueil(regionAccueil);

      //get percentage repartition
      const avancement =
        (region2department[region].reduce((acc, department) => {
          if (!data.find((e) => e.fromDepartment === department)) return acc;
          return (acc += 1);
        }, 0) /
          region2department[region].length) *
          100 || 0;

      setAvancement(Math.trunc(avancement));

      return regionAccueil;
    } catch (e) {
      capture(e);
      toastr.error("Oups, une erreur est survenue lors de la récupération des données");
    }
  };

  // Normal view
  React.useEffect(() => {
    (async () => {
      try {
        setLoadingQuery(true);

        const regionAccueil = await getRepartitionDepartment();
        if (regionAccueil.length === 0) {
          toastr.error(`Aucune région d'accueil définie pour la région ${region}`);
          return history.push("/plan-de-transport/table-repartition");
        }

        //get youngs by department
        const response = await API.post("/elasticsearch/young/search", {
          filters: { cohort: [cohort], status: ["VALIDATED"], region: [region] },
        });
        if (!response.responses.length) return toastr.error("Oups, une erreur est survenue lors de la récupération des volontaires");
        setYoungsByDepartment(response.responses[1].aggregations.department.names.buckets);
        setYoungsTotal(response.responses[0].hits.total.value);

        //get places center by host region
        const { ok: res, data: centers } = await API.post("/elasticsearch/cohesioncenter/export?needSessionPhase1Info=true", {
          filters: { cohorts: [cohort], region: regionAccueil },
        });
        if (!res) return toastr.error("Oups, une erreur est survenue lors de la récupération des centres");

        setCenterTotal(centers.length);

        const sessionPlacesBycohesionCenterDepartment = {};
        centers.forEach((center) => {
          center.sessionsPhase1.forEach((session) => {
            if (session.cohort === cohort) {
              if (!sessionPlacesBycohesionCenterDepartment[center.department]) {
                sessionPlacesBycohesionCenterDepartment[center.department] = 0;
              }
              sessionPlacesBycohesionCenterDepartment[center.department] += session.placesTotal;
            }
          });
        });

        setPlacesCenterByDepartment(sessionPlacesBycohesionCenterDepartment);

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

  const onCreate = async (fromDepartment, toDepartment) => {
    try {
      //update real time
      setData([...data, { fromRegion: region, toRegion: department2region[toDepartment], fromDepartment, toDepartment }]);
      const { ok } = await API.post(`/table-de-repartition/department`, { fromRegion: region, toRegion: department2region[toDepartment], fromDepartment, toDepartment, cohort });
      if (!ok) return toastr.error("Oups, une erreur est survenue lors de l'ajout de la region d'accueil");
      await getRepartitionDepartment();
    } catch (e) {
      capture(e);
      toastr.error("Oups, une erreur est survenue lors de l'ajout de la region d'accueil");
      await getRepartitionDepartment();
    }
  };

  const onDelete = async (fromDepartment, toDepartment) => {
    try {
      //update real time
      let update = data.filter((e) => e.fromDepartment !== fromDepartment || e.toDepartment !== toDepartment);
      setData(update);
      const { ok } = await API.post(`/table-de-repartition/delete/department`, {
        fromRegion: region,
        toRegion: department2region[toDepartment],
        fromDepartment,
        toDepartment,
        cohort,
      });
      if (!ok) return toastr.error("Oups, une erreur est survenue lors de la suppression de la region d'accueil");
      await getRepartitionDepartment();
    } catch (e) {
      capture(e);
      toastr.error("Oups, une erreur est survenue lors de la suppression de la region d'accueil");
      await getRepartitionDepartment();
    }
  };

  const selectAll = async (fromDepartment) => {
    setLoadingQuery(true);
    const listDepartments = regionAccueil.map((e) => region2department[e]).flat();
    const toCreate = listDepartments.filter((d) => !data.find((e) => e.fromDepartment === fromDepartment && e.toDepartment === d));
    for (let i = 0; i < toCreate.length; i++) {
      await onCreate(fromDepartment, toCreate[i]);
    }
    setLoadingQuery(false);
  };

  return (
    <>
      <div className="mb-4 flex flex-row items-stretch gap-4">
        <div className="flex w-3/12 flex-col gap-4">
          <div className="flex flex-col gap-2 rounded-lg bg-white p-4 shadow-sm">
            <div className="text-sm font-bold leading-5 text-gray-800">Avancement</div>
            <div className="text-2xl font-bold leading-7 text-gray-800">{avancement} %</div>
          </div>
          <div className="flex flex-col gap-2 rounded-lg bg-white p-4 shadow-sm">
            <div className="text-sm font-bold leading-5 text-gray-800">Volontaires de la région</div>
            <div className="flex items-center gap-2 ">
              <Profil className="text-gray-400" />
              <div className="text-2xl font-bold leading-7 text-gray-800">{youngsTotal}</div>
            </div>
          </div>
        </div>
        <div className="relative flex w-4/12 flex-col gap-4 rounded-lg bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="text-sm font-bold leading-5 text-gray-800">Région(s) d&apos;accueil</div>
            <div className="rounded-lg bg-[#E8EDFF] px-1 text-xs font-bold uppercase leading-5 text-[#0063CB]">{centerTotal} Centre(s)</div>
          </div>
          {regionAccueil.map((r) => (
            <div key={r} className="text-lg font-bold leading-5 text-gray-800">
              {r}
            </div>
          ))}
          <div className="absolute  bottom-4 right-0">
            <FrenchMap />
          </div>
          <div className="absolute bottom-4 right-6 flex cursor-pointer items-center gap-1 hover:underline" onClick={() => history.push("/table-repartition?cohort=" + cohort)}>
            <div className="text-xs leading-5 text-blue-600 ">Table de répartition</div>
            <BsChevronRight className="text-blue-600 " />
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
          {/* <button className="bg-blue-600 border-[1px] border-blue-600 text-white px-4 py-2 rounded-lg hover:bg-white hover:!text-blue-600 transition ease-in-out">Exporter</button> */}
        </div>
        <hr />
        <div className="flex items-center px-4 py-2">
          <div className="w-[30%] text-xs uppercase leading-3 text-[#7E858C]">Départements de départ</div>
          <div className="w-[70%] text-xs uppercase leading-3 text-[#7E858C]">Départements d&apos;accueil</div>
        </div>
        {departments?.length ? (
          departments.map((department) => (
            <Department
              key={department}
              department={department}
              data={data}
              loadingQuery={loadingQuery}
              youngInDepartment={youngsByDepartment.find((r) => r.key === department)?.doc_count || 0}
              placesCenterByDepartment={placesCenterByDepartment}
              onCreate={onCreate}
              onDelete={onDelete}
              regionAccueil={regionAccueil}
              selectAll={selectAll}
              user={user}
            />
          ))
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

const Department = ({ department, loadingQuery, data, youngInDepartment, placesCenterByDepartment, onCreate, onDelete, regionAccueil, selectAll, user }) => {
  const [open, setOpen] = React.useState(false);
  const [assignDepartment, setAssignDepartment] = React.useState([]);
  const canEdit = (user.role === ROLES.REFERENT_REGION && user.region === department2region[department]) || user.role === ROLES.ADMIN;

  React.useEffect(() => {
    let assignDepartment = data.filter((e) => e.fromDepartment === department) || [];
    setAssignDepartment(assignDepartment);
  }, [data]);

  return (
    <>
      <hr />
      <div className="flex items-center px-4 py-2">
        <div className="flex w-[30%] flex-col gap-1">
          <div className="text-base font-bold leading-6 text-[#242526]">
            {department} ({getDepartmentNumber(department)})
          </div>
          <div className="flex items-center text-xs leading-4 text-gray-800">{loadingQuery ? <Loading width="w-1/3" /> : `${youngInDepartment} volontaires`}</div>
        </div>
        <div className="w-[70%]">
          {loadingQuery ? (
            <Loading width="w-1/3" />
          ) : (
            <div className="relative flex flex-row flex-wrap items-center gap-2">
              {assignDepartment.map((assign, i) => (
                <div key={i + "assign"} className="rounded-full bg-gray-100 p-2 text-xs text-gray-700">
                  {assign.toDepartment} ({getDepartmentNumber(assign.toDepartment)})
                </div>
              ))}
              {canEdit && (
                <>
                  {assignDepartment.length === 0 ? (
                    <button className="cursor-pointer rounded-full bg-blue-600 px-2 py-1 text-xs leading-5 text-white hover:scale-105" onClick={() => setOpen(!open)}>
                      À assigner
                    </button>
                  ) : (
                    <div className="flex cursor-pointer items-center rounded-full bg-blue-600 p-2 hover:scale-105" onClick={() => setOpen(!open)}>
                      <Pencil className="h-4 w-4 text-white" />
                    </div>
                  )}
                  {open ? (
                    <SelectHostDepartment
                      department={department}
                      setOpen={setOpen}
                      placesCenterByDepartment={placesCenterByDepartment}
                      onCreate={onCreate}
                      assignDepartment={assignDepartment}
                      onDelete={onDelete}
                      regionAccueil={regionAccueil}
                      selectAll={selectAll}
                    />
                  ) : null}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

const SelectHostDepartment = ({ department, setOpen, onCreate, assignDepartment, onDelete, regionAccueil, placesCenterByDepartment, selectAll }) => {
  const ref = React.useRef(null);

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside, true);
    return () => {
      document.removeEventListener("click", handleClickOutside, true);
    };
  }, []);

  const onChange = (fromDepartment, toDepartment) => {
    if (assignDepartment.filter((e) => e.toDepartment === toDepartment)?.length !== 0) onDelete(fromDepartment, toDepartment);
    else onCreate(fromDepartment, toDepartment);
  };

  return (
    <div ref={ref} className="absolute top-[110%] left-[0px] z-50 flex h-60 w-[70%] flex-col overflow-y-auto rounded-lg bg-white shadow-ninaButton">
      {regionAccueil.map((region, index) => (
        <div key={region} className="flex flex-col ">
          <div className="flex flex-row items-center justify-between px-3 py-2">
            <div className="text-xs font-medium leading-4 text-gray-500">{region}</div>
            {index === 0 && (
              <div className="cursor-pointer text-xs leading-5 text-blue-600 underline" onClick={() => selectAll(department)}>
                Tout sélectionner
              </div>
            )}
          </div>
          {region2department[region].map((d) => (
            <div key={d} className="flex cursor-pointer flex-row items-center justify-between px-3 py-2 hover:bg-gray-100" onClick={() => onChange(department, d)}>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <input type={"checkbox"} checked={assignDepartment.find((e) => e.toDepartment === d) || false} readOnly />
                {d} ({getDepartmentNumber(d)})
              </div>
              <div className="text-sm uppercase text-gray-500">{placesCenterByDepartment[d] ? placesCenterByDepartment[d] : 0} places</div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};
