import React from "react";
import { ES_NO_LIMIT } from "snu-lib";
import Breadcrumbs from "../../../components/Breadcrumbs";
import API from "../../../services/api";
import { Loading, SubTitle, Title, regionList } from "../components/commons";

export default function TableauRepartition() {
  const [cohort, setCohort] = React.useState("Juillet 2022");
  const [cohortList, setCohortList] = React.useState(["Février 2023 - C", "Avril 2023 - A", "Avril 2023 - B", "Juin 2023", "Juillet 2023"]);
  const [youngsByRegion, setYoungsByRegion] = React.useState([]);
  const [placesCenterByRegion, setPlacesCenterByRegion] = React.useState({});
  const [loadingQuery, setLoadingQuery] = React.useState(false);
  const [searchRegion, setSearchRegion] = React.useState("");
  const [regions, setRegions] = React.useState(regionList);

  React.useEffect(() => {
    (async () => {
      setLoadingQuery(true);
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
    })();
  }, []);

  React.useEffect(() => {
    let regions = regionList.filter((e) => {
      if (searchRegion === "") return true;
      return e.toLowerCase().includes(searchRegion);
    });
    setRegions(regions);
  }, [searchRegion]);

  const onChange = async (fromRegion, toRegion) => {
    console.log(fromRegion, toRegion);
  };

  return (
    <>
      <Breadcrumbs items={[{ label: "Plan de transport", to: "/plan-de-transport" }, { label: "Table de répartition" }]} />
      <div className="flex flex-col w-full px-12 pb-8 ">
        <div className="py-8 flex items-center justify-between">
          <div className="flex flex-col gap-3">
            <Title>Tableau de répartition</Title>
            <SubTitle>Assignez une ou des régions d’accueil à votre région</SubTitle>
          </div>
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
            <button className="bg-blue-600 border-[1px] border-blue-600 text-white px-4 py-2 rounded-lg hover:bg-white hover:!text-blue-600 transition ease-in-out">
              Exporter
            </button>
          </div>

          <hr />
          <div className="flex px-4 py-2 items-center">
            <div className="w-[40%] uppercase text-[#7E858C] text-xs leading-3">Région</div>
            <div className="w-[50%] uppercase text-[#7E858C] text-xs leading-3">Région d&apos;accueil</div>
            <div className="w-[10%] uppercase text-[#7E858C] text-xs leading-3">Avancement</div>
          </div>

          {regions?.length ? (
            regions.map((region) => (
              <Region
                key={region}
                region={region}
                youngsInRegion={youngsByRegion.find((r) => r.key === region)?.doc_count || 0}
                placesCenterByRegion={placesCenterByRegion}
                onChange={onChange}
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

const Region = ({ region, youngsInRegion, placesCenterByRegion, loadingQuery, onChange }) => {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <hr />
      <div className="flex px-4 py-2 items-center">
        <div className="w-[40%] flex flex-col gap-1">
          <div className="text-base text-[#242526] font-bold leading-6">{region}</div>
          <div className="flex text-xs text-gray-800 leading-4 items-center">{loadingQuery ? <Loading width="w-1/3" /> : `${youngsInRegion} volontaires`}</div>
        </div>
        <div className="w-[50%]">
          {loadingQuery ? (
            <Loading width="w-1/3" />
          ) : (
            <div className="relative flex flex-row gap-2 items-center">
              <button className="px-2 py-1 cursor-pointer text-white text-xs leading-5 rounded-full bg-blue-600 hover:scale-105" onClick={() => setOpen(!open)}>
                À assigner
              </button>
              {open ? <SelectHostRegion region={region} setOpen={setOpen} placesCenterByRegion={placesCenterByRegion} onChange={onChange} /> : null}
            </div>
          )}
        </div>
        <div className="w-[10%]">{loadingQuery ? <Loading width="w-2/3" /> : <div>coucou</div>}</div>
      </div>
    </>
  );
};

const SelectHostRegion = ({ region, placesCenterByRegion, setOpen, onChange }) => {
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

  return (
    <div ref={ref} className="absolute z-50 flex flex-col bg-white top-[110%] left-[0px] shadow-ninaButton rounded-lg w-[90%] py-2">
      {regionList
        .filter((e) => e !== region)
        .map((r, i) => (
          <div key={i} className="flex flex-row items-center justify-between px-3 py-2 cursor-pointer hover:bg-gray-100" onClick={() => onChange(region, r)}>
            <div className="flex items-center gap-2 text-gray-700 text-sm">
              <input type={"checkbox"} />
              {r}
            </div>
            <div className="text-sm text-gray-500 uppercase">{placesCenterByRegion[r] ? placesCenterByRegion[r] : 0} places</div>
          </div>
        ))}
    </div>
  );
};
