import React from "react";
import { toastr } from "react-redux-toastr";
import { ES_NO_LIMIT, ROLES } from "snu-lib";
import Pencil from "../../../assets/icons/Pencil";
import Breadcrumbs from "../../../components/Breadcrumbs";
import Select from "../components/Select";
import { capture } from "../../../sentry";
import API from "../../../services/api";
import { Loading, regionList, SubTitle, Title } from "../components/commons";
import { useHistory } from "react-router-dom";
import { useSelector } from "react-redux";

export default function National() {
  const user = useSelector((state) => state.Auth.user);
  const [cohort, setCohort] = React.useState("Février 2023 - C");
  const cohortList = [
    { label: "Séjour du <b>19 Février au 3 Mars 2023</b>", value: "Février 2023 - C" },
    { label: "Séjour du <b>9 au 21 Avril 2023</b>", value: "Avril 2023 - A" },
    { label: "Séjour du <b>16 au 28 Avril 2023</b>", value: "Avril 2023 - B" },
    { label: "Séjour du <b>11 au 23 Juin 2023</b>", value: "Juin 2023" },
    { label: "Séjour du <b>4 au 16 Juillet 2023</b>", value: "Juillet 2023" },
  ];

  const [youngsByRegion, setYoungsByRegion] = React.useState([]);
  const [placesCenterByRegion, setPlacesCenterByRegion] = React.useState({});
  const [loadingQuery, setLoadingQuery] = React.useState(false);
  const [searchRegion, setSearchRegion] = React.useState("");
  const [regions, setRegions] = React.useState(regionList);
  const [data, setData] = React.useState([]);

  const getRepartitionRegion = async () => {
    try {
      const { data, ok } = await API.get(`/table-de-repartition/national/${cohort}`);
      if (!ok) return toastr.error("Oups, une erreur est survenue lors de la récupération des données");
      setData(data);
    } catch (e) {
      capture(e);
      toastr.error("Oups, une erreur est survenue lors de la récupération des données");
    }
  };

  React.useEffect(() => {
    (async () => {
      try {
        setLoadingQuery(true);

        await getRepartitionRegion();

        //get youngs by region
        const bodyYoung = {
          query: { bool: { must: { match_all: {} }, filter: [{ term: { "cohort.keyword": cohort } }, { terms: { "status.keyword": ["VALIDATED"] } }] } },
          aggs: {
            region: { terms: { field: "region.keyword" } },
          },
          track_total_hits: true,
          size: 0,
        };

        const { responses } = await API.esQuery("young", bodyYoung);
        setYoungsByRegion(responses[0].aggregations.region.buckets);

        //get places center by region
        const bodyCohesionCenter = {
          query: { bool: { must: { match_all: {} }, filter: [{ terms: { "cohorts.keyword": [cohort] } }] } },
          track_total_hits: true,
          size: ES_NO_LIMIT,
        };

        const { responses: responsesCenter } = await API.esQuery("cohesioncenter", bodyCohesionCenter);
        const centerDetail = responsesCenter[0].hits.hits.map((e) => new Object({ ...e._source, _id: e._id }));

        const bodySession = {
          query: { bool: { must: { match_all: {} }, filter: [{ terms: { "cohesionCenterId.keyword": centerDetail.map((c) => c._id) } }, { term: { "cohort.keyword": cohort } }] } },
          track_total_hits: true,
          size: ES_NO_LIMIT,
        };

        const { responses: responsesSession } = await API.esQuery("sessionphase1", bodySession);
        const sessionsDetail = responsesSession[0].hits.hits.map((e) => e._source);

        const sessionPlacesBycohesionCenterRegion = sessionsDetail.reduce((acc, session) => {
          const region = centerDetail.find((c) => c._id === session.cohesionCenterId).region;
          if (!acc[region]) acc[region] = 0;
          acc[region] += session.placesTotal;
          return acc;
        }, {});

        setPlacesCenterByRegion(sessionPlacesBycohesionCenterRegion);
        setLoadingQuery(false);
      } catch (e) {
        capture(e);
        toastr.error("Oups, une erreur est survenue lors de la récupération des données");
      }
    })();
  }, [cohort]);

  React.useEffect(() => {
    let regions = regionList.filter((e) => {
      if (searchRegion === "") return true;
      return e.toLowerCase().includes(searchRegion.toLowerCase());
    });
    setRegions(regions);
  }, [searchRegion]);

  const onCreate = async (fromRegion, toRegion) => {
    try {
      //update real time
      setData([...data, { fromRegion, toRegion }]);
      const { ok } = await API.post(`/table-de-repartition/region`, { fromRegion, toRegion, cohort });
      if (!ok) return toastr.error("Oups, une erreur est survenue lors de l'ajout de la region d'accueil");
      await getRepartitionRegion();
    } catch (e) {
      capture(e);
      toastr.error("Oups, une erreur est survenue lors de l'ajout de la region d'accueil");
      await getRepartitionRegion();
    }
  };

  const onDelete = async (fromRegion, toRegion) => {
    try {
      //update real time
      let update = data.filter((e) => e.fromRegion !== fromRegion || e.toRegion !== toRegion);
      setData(update);
      const { ok } = await API.post(`/table-de-repartition/delete/region`, { fromRegion, toRegion, cohort });
      if (!ok) return toastr.error("Oups, une erreur est survenue lors de la suppression de la region d'accueil");
      await getRepartitionRegion();
    } catch (e) {
      capture(e);
      toastr.error("Oups, une erreur est survenue lors de la suppression de la region d'accueil");
      await getRepartitionRegion();
    }
  };

  return (
    <>
      <Breadcrumbs items={[{ label: "Plan de transport", to: "/plan-de-transport" }, { label: "Table de répartition" }]} />
      <div className="flex flex-col w-full px-8 pb-8 ">
        <div className="py-8 flex items-center justify-between">
          <div className="flex flex-col gap-3">
            <Title>Table de répartition</Title>
            <SubTitle>Assignez une ou des régions d’accueil à votre région</SubTitle>
          </div>
          <Select options={cohortList} value={cohort} onChange={(e) => setCohort(e)} />
        </div>
        <div className="flex flex-col gap-2 rounded-lg bg-white pb-3">
          <div className="flex px-4 py-3 items-center justify-between w-full">
            <input
              type="text"
              name="search"
              className=" border border-gray-300 rounded-lg px-4 py-2 w-1/3"
              placeholder="Rechercher une region"
              onChange={(e) => setSearchRegion(e.target.value)}
            />
            {/* <button className="bg-blue-600 border-[1px] border-blue-600 text-white px-4 py-2 rounded-lg hover:bg-white hover:!text-blue-600 transition ease-in-out">
              Exporter
            </button> */}
          </div>

          <hr />
          <div className="flex px-4 py-2 items-center">
            <div className="w-[30%] uppercase text-[#7E858C] text-xs leading-3">Région</div>
            <div className="w-[60%] uppercase text-[#7E858C] text-xs leading-3">Région d&apos;accueil</div>
            <div className="w-[10%] uppercase text-[#7E858C] text-xs leading-3 text-center">Avancement</div>
          </div>

          {regions?.length ? (
            regions.map((region) => (
              <Region
                key={"region" + region}
                region={region}
                youngsInRegion={youngsByRegion.find((r) => r.key === region)?.doc_count || 0}
                placesCenterByRegion={placesCenterByRegion}
                onCreate={onCreate}
                onDelete={onDelete}
                data={data}
                loadingQuery={loadingQuery}
                cohort={cohort}
                user={user}
              />
            ))
          ) : (
            <>
              <hr />
              <div className="flex px-4 pb-4 pt-2 items-center justify-center w-full">
                <div className="text-sm text-[#7E858C] leading-6">Aucune région ne correspond à votre recherche</div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

const Region = ({ region, youngsInRegion, placesCenterByRegion, loadingQuery, onCreate, data, onDelete, cohort, user }) => {
  const [open, setOpen] = React.useState(false);
  const [assignRegion, setAssignRegion] = React.useState([]);
  const [avancement, setAvancement] = React.useState(0);
  const editDisabled = user.role !== ROLES.ADMIN;
  const history = useHistory();

  React.useEffect(() => {
    let assignRegion = data.filter((e) => e.fromRegion === region) || [];
    setAssignRegion(assignRegion);
    setAvancement(assignRegion.length ? assignRegion[0].avancement : 0);
  }, [data]);

  return (
    <>
      <hr />
      <div className="flex px-4 py-2 items-center">
        <div
          className={`w-[30%] flex flex-col gap-1 ${assignRegion.length ? "cursor-pointer" : ""}`}
          onClick={() => assignRegion.length && history.push(`/plan-de-transport/table-repartition/regional?cohort=${cohort}&region=${region}`)}>
          <div className="text-base text-[#242526] font-bold leading-6">{region}</div>
          <div className="flex text-xs text-gray-800 leading-4 items-center">{loadingQuery ? <Loading width="w-1/3" /> : `${youngsInRegion} volontaires`}</div>
        </div>
        <div className="w-[60%]">
          {loadingQuery ? (
            <Loading width="w-1/3" />
          ) : (
            <div className="relative flex flex-row gap-2 items-center flex-wrap">
              {assignRegion.map((assign, i) => (
                <div key={i + "assign"} className="text-xs text-gray-700 bg-gray-100 rounded-full p-2">
                  {assign.toRegion}
                </div>
              ))}
              {!editDisabled && (
                <>
                  {assignRegion.length === 0 ? (
                    <button className="px-2 py-1 cursor-pointer text-white text-xs leading-5 rounded-full bg-blue-600 hover:scale-105" onClick={() => setOpen(!open)}>
                      À assigner
                    </button>
                  ) : (
                    <div className="flex items-center p-2 rounded-full bg-blue-600 cursor-pointer hover:scale-105" onClick={() => setOpen(!open)}>
                      <Pencil className="w-4 h-4 text-white" />
                    </div>
                  )}
                  {open ? (
                    <SelectHostRegion
                      region={region}
                      setOpen={setOpen}
                      placesCenterByRegion={placesCenterByRegion}
                      onCreate={onCreate}
                      assignRegion={assignRegion}
                      onDelete={onDelete}
                    />
                  ) : null}
                </>
              )}
            </div>
          )}
        </div>
        <div className="w-[10%] text-center">
          {loadingQuery ? (
            <Loading width="w-2/3" />
          ) : (
            <div className="flex justify-center">
              <div className={`px-2 py-1 rounded-lg text-xs font-bold uppercase leading-5 ${avancement === 100 ? "text-green-600 bg-[#E4F3EC]" : "text-blue-600 bg-[#E8EDFF]"}`}>
                {avancement} %
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

const SelectHostRegion = ({ region, placesCenterByRegion, setOpen, onCreate, assignRegion, onDelete }) => {
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

  //Because Dom Tom can assign young to the same region
  const DOMTOM = ["Guadeloupe", "Martinique", "Guyane", "La Réunion", "Mayotte", "Polynésie française", "Nouvelle-Calédonie"];
  const isDomTom = DOMTOM.includes(region);

  const onChange = (fromRegion, toRegion) => {
    if (assignRegion.filter((e) => e.toRegion === toRegion)?.length !== 0) onDelete(fromRegion, toRegion);
    else onCreate(fromRegion, toRegion);
  };
  return (
    <div ref={ref} className="absolute z-50 flex flex-col bg-white top-[110%] left-[0px] shadow-ninaButton rounded-lg w-[90%] py-2 h-60 overflow-y-auto">
      {regionList
        .filter((e) => isDomTom || e !== region)
        .map((r, i) => {
          return (
            <div key={r + i} className="flex flex-row items-center justify-between px-3 py-2 cursor-pointer hover:bg-gray-100" onClick={() => onChange(region, r)}>
              <div className="flex items-center gap-2 text-gray-700 text-sm">
                <input type={"checkbox"} checked={assignRegion.find((e) => e.toRegion === r) || false} readOnly />
                {r}
              </div>
              <div className="text-sm text-gray-500 uppercase">{placesCenterByRegion[r] ? placesCenterByRegion[r] : 0} places</div>
            </div>
          );
        })}
    </div>
  );
};
