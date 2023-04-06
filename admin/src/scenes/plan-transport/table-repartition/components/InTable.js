import React from "react";
import { toastr } from "react-redux-toastr";
import { ES_NO_LIMIT, region2department } from "snu-lib";
import Profil from "../../../../assets/icons/Profil";
import { capture } from "../../../../sentry";
import API from "../../../../services/api";
import { Loading } from "../../components/commons";

export function InTable({ region, cohort }) {
  const [loadingQuery, setLoadingQuery] = React.useState(false);
  const [data, setData] = React.useState([]);
  const [centerTotal, setCenterTotal] = React.useState(0);
  const [placesTotal, setPlacesTotal] = React.useState(0);
  const [searchDepartment, setSearchDepartment] = React.useState("");
  const [departments, setDepartments] = React.useState(region2department[region]);
  const [objectifByDepartment, setObjectifByDepartment] = React.useState([]);

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
          {/* <button className="bg-blue-600 border-[1px] border-blue-600 text-white px-4 py-2 rounded-lg hover:bg-white hover:!text-blue-600 transition ease-in-out">Exporter</button> */}
        </div>
        <hr />
        <div className="flex px-4 py-2 items-center">
          <div className="w-[30%] uppercase text-[#7E858C] text-xs leading-3">Départements d&apos;accueil</div>
          <div className="w-[70%] uppercase text-[#7E858C] text-xs leading-3">Régions accueillies</div>
        </div>
        {departments?.length ? (
          departments.map((department) => (
            <Department key={"reverse" + department} department={department} data={data} loadingQuery={loadingQuery} objectifByDepartment={objectifByDepartment} />
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
    </>
  );
}

const Department = ({ department, loadingQuery, data, objectifByDepartment }) => {
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
                    className="relative text-xs text-gray-700 bg-gray-100 rounded-full p-2 cursor-pointer hover:scale-105"
                    onClick={() => setOpen({ open: true, region: assign.fromRegion })}>
                    {assign.fromRegion}
                  </div>
                  {open.open && open.region === assign.fromRegion && (
                    <InfoDepartment
                      region={assign.fromRegion}
                      setOpen={setOpen}
                      assignDepartment={departmentByRegion[assign.fromRegion]}
                      objectifByDepartment={objectifByDepartment}
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

const InfoDepartment = ({ setOpen, assignDepartment, region, objectifByDepartment }) => {
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
    <div ref={ref} className="absolute z-50 flex flex-col bg-white top-[110%] left-[0px] shadow-ninaButton rounded-lg w-[40%] py-2 max-h-60 overflow-y-auto">
      <div className="flex flex-col gap-2 px-2">
        <div className="text-gray-500 text-xs font-medium leading-4">{region}</div>
        {assignDepartment.map((assign, i) => (
          <div key={i + "assignDepartment"} className="flex flex-row justify-between relative">
            <div className="text-sm leading-5 text-gray-700 ">{assign}</div>
            <div className="flex items-center gap-2 pr-2">
              <Profil className="text-gray-400" />
              <div className="text-sm leading-5 text-gray-500 font-normal">
                {objectifByDepartment.find((e) => e.department === assign) ? objectifByDepartment.find((e) => e.department === assign).max || 0 : 0}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
