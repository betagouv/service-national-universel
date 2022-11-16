import React from "react";
import { toastr } from "react-redux-toastr";
import { department2region, ES_NO_LIMIT, region2department } from "snu-lib";
import Pencil from "../../../assets/icons/Pencil";
import Breadcrumbs from "../../../components/Breadcrumbs";
import { capture } from "../../../sentry";
import API from "../../../services/api";
import { Loading, SubTitle, Title } from "../components/commons";
import Select from "../components/Select";

export default function Regional() {
  const urlParams = new URLSearchParams(window.location.search);
  const region = urlParams.get("region");
  const [cohort, setCohort] = React.useState("Juillet 2022"); //React.useState(urlParams.get("cohort"));
  const cohortList = [
    { label: "Juillet 2022", value: "Juillet 2022" },
    { label: "Séjour du <b>19 Février au 3 Mars 2023</b>", value: "Février 2023 - C" },
    { label: "Séjour du <b>9 au 21 Avril 2023</b>", value: "Avril 2023 - A" },
    { label: "Séjour du <b>16 au 28 Avril 2023</b>", value: "Avril 2023 - B" },
    { label: "Séjour du <b>11 au 23 Juin 2023</b>", value: "Juin 2023" },
    { label: "Séjour du <b>4 au 16 Juillet 2023</b>", value: "Juillet 2023" },
  ];
  const [loadingQuery, setLoadingQuery] = React.useState(false);

  //info
  const [youngsTotal, setYoungsTotal] = React.useState(0);
  const [centerTotal, setCenterTotal] = React.useState(0);
  const [regionAccueil, setRegionAccueil] = React.useState([]);

  //precess
  const [data, setData] = React.useState([]);
  const [youngsByDepartment, setYoungsByDepartment] = React.useState([]);
  const [placesCenterByDepartment, setPlacesCenterByDepartment] = React.useState({});
  const [searchDepartment, setSearchDepartment] = React.useState("");
  const [departments, setDepartments] = React.useState(region2department[region]);

  const getRepartitionDepartment = async () => {
    try {
      const { data, ok } = await API.get(`/table-de-repartition/department/${cohort}/${region}`);
      if (!ok) return toastr.error("Oups, une erreur est survenue lors de la récupération des données");
      setData(data);
      const filteredData = data.filter((e, i) => {
        return i === data.findIndex((a) => a.fromRegion === e.fromRegion && a.toRegion === e.toRegion);
      });
      setRegionAccueil(filteredData.map((e) => e.toRegion));
      return filteredData.map((e) => e.toRegion);
    } catch (e) {
      capture(e);
      toastr.error("Oups, une erreur est survenue lors de la récupération des données");
    }
  };

  React.useEffect(() => {
    (async () => {
      try {
        setLoadingQuery(true);

        let regionAccueil = await getRepartitionDepartment();

        //get youngs by department
        const bodyYoung = {
          query: {
            bool: {
              must: { match_all: {} },
              filter: [{ term: { "cohort.keyword": cohort } }, { terms: { "status.keyword": ["VALIDATED"] } }, { term: { "region.keyword": region } }],
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
        setYoungsTotal(responses[0].hits.total.value);

        //get places center by host region
        const bodyCohesionCenter = {
          query: { bool: { must: { match_all: {} }, filter: [{ terms: { "cohorts.keyword": [cohort] } }, { terms: { "region.keyword": regionAccueil } }] } },
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

        const sessionPlacesBycohesionCenterDepartment = sessionsDetail.reduce((acc, session) => {
          const department = centerDetail.find((c) => c._id === session.cohesionCenterId).department;
          if (!acc[department]) acc[department] = 0;
          acc[department] += session.placesTotal;
          return acc;
        }, {});

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
      <Breadcrumbs
        items={[{ label: "Plan de transport", to: "/plan-de-transport" }, { label: "Table de répartition", to: "/plan-de-transport/table-repartition" }, { label: region }]}
      />
      <div className="flex flex-col w-full px-12 pb-8 ">
        <div className="py-8 flex items-center justify-between">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Title>Table de répartition </Title>
              <div className="text-2xl text-gray-600 leading-7">{region}</div>
            </div>
            <SubTitle>Assignez les départements d’accueil des volontaires de {region}</SubTitle>
          </div>
          <Select options={cohortList} value={cohort} onChange={(e) => setCohort(e)} />
        </div>
        <div className="flex flex-col gap-2 rounded-lg bg-white pb-3">
          <div className="flex px-4 py-3 items-center justify-between w-full">
            <input
              type="text"
              name="search"
              className=" border border-gray-300 rounded-lg px-4 py-2 w-1/3"
              placeholder="Rechercher un département"
              onChange={(e) => setSearchDepartment(e.target.value)}
            />
            <button className="bg-blue-600 border-[1px] border-blue-600 text-white px-4 py-2 rounded-lg hover:bg-white hover:!text-blue-600 transition ease-in-out">
              Exporter
            </button>
          </div>
          <hr />
          <div className="flex px-4 py-2 items-center">
            <div className="w-[30%] uppercase text-[#7E858C] text-xs leading-3">Départements de départ</div>
            <div className="w-[70%] uppercase text-[#7E858C] text-xs leading-3">Départements d’accueil</div>
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
              />
            ))
          ) : (
            <>
              <hr />
              <div className="flex px-4 pb-4 pt-2 items-center justify-center w-full">
                <div className="text-sm text-[#7E858C] leading-6">Aucun département ne correspond à votre recherche</div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

const Department = ({ department, loadingQuery, data, youngInDepartment, placesCenterByDepartment, onCreate, onDelete, regionAccueil, selectAll }) => {
  const [open, setOpen] = React.useState(false);
  const [assignDepartment, setAssignDepartment] = React.useState([]);

  React.useEffect(() => {
    let assignDepartment = data.filter((e) => e.fromDepartment === department) || [];
    setAssignDepartment(assignDepartment);
  }, [data]);

  return (
    <>
      <hr />
      <div className="flex px-4 py-2 items-center">
        <div className="w-[30%] flex flex-col gap-1">
          <div className="text-base text-[#242526] font-bold leading-6">{department}</div>
          <div className="flex text-xs text-gray-800 leading-4 items-center">{loadingQuery ? <Loading width="w-1/3" /> : `${youngInDepartment} volontaires`}</div>
        </div>
        <div className="w-[70%]">
          {loadingQuery ? (
            <Loading width="w-1/3" />
          ) : (
            <div className="relative flex flex-row gap-2 items-center flex-wrap">
              {assignDepartment.map((assign) => (
                <div key={assign._id} className="text-xs text-gray-700 bg-gray-100 rounded-full p-2">
                  {assign.toDepartment}
                </div>
              ))}
              {assignDepartment.length === 0 ? (
                <button className="px-2 py-1 cursor-pointer text-white text-xs leading-5 rounded-full bg-blue-600 hover:scale-105" onClick={() => setOpen(!open)}>
                  À assigner
                </button>
              ) : (
                <div className="flex items-center p-2 rounded-full bg-blue-600 cursor-pointer hover:scale-105" onClick={() => setOpen(!open)}>
                  <Pencil className="w-4 h-4 text-white" />
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
    <div ref={ref} className="absolute z-50 flex flex-col bg-white top-[110%] left-[0px] shadow-ninaButton rounded-lg w-[70%] py-2 h-60 overflow-y-auto">
      {regionAccueil.map((region, index) => (
        <div key={region} className="flex flex-col ">
          <div className="flex flex-row items-center justify-between px-3 py-2">
            <div className="text-gray-500 text-xs font-medium leading-4">{region}</div>
            {index === 0 && (
              <div className="cursor-pointer text-blue-600 underline text-xs leading-5" onClick={() => selectAll(department)}>
                Tout sélectionner
              </div>
            )}
          </div>
          {region2department[region].map((d) => (
            <div key={d} className="flex flex-row items-center justify-between px-3 py-2 cursor-pointer hover:bg-gray-100" onClick={() => onChange(department, d)}>
              <div className="flex items-center gap-2 text-gray-700 text-sm">
                <input type={"checkbox"} checked={assignDepartment.find((e) => e.toDepartment === d) || false} />
                {d}
              </div>
              <div className="text-sm text-gray-500 uppercase">{placesCenterByDepartment[d] ? placesCenterByDepartment[d] : 0} places</div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};
