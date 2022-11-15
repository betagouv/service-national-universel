import React from "react";
import { Title, SubTitle } from "../components/commons";
import Breadcrumbs from "../../../components/Breadcrumbs";
import API from "../../../services/api";
import { ES_NO_LIMIT, regionList } from "snu-lib";
import { Spinner } from "reactstrap";

export default function TableauRepartition() {
  const [cohort, setCohort] = React.useState("Juillet 2022");
  const [cohortList, setCohortList] = React.useState(["Février 2023 - C", "Avril 2023 - A", "Avril 2023 - B", "Juin 2023", "Juillet 2023"]);
  const [youngsByRegion, setYoungsByRegion] = React.useState([]);
  const [placesCenterByRegion, setPlacesCenterByRegion] = React.useState({});
  const [loadingQuery, setLoadingQuery] = React.useState(false);

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
        <div className="flex flex-col gap-2 rounded-lg bg-white">
          <hr />
          <div className="flex px-4 py-2">
            <div className="w-[45%] uppercase text-[#7E858C] text-xs leading-3">Région</div>
            <div className="w-[45%] uppercase text-[#7E858C] text-xs leading-3">Région d&apos;accueil</div>
            <div className="w-[10%] uppercase text-[#7E858C] text-xs leading-3">Avancement</div>
          </div>

          {regionList.map((region) => (
            <>
              <hr />
              <div className="flex px-4 py-2 items-center">
                <div className="w-[45%] flex flex-col gap-1">
                  <div className="text-base text-[#242526] font-bold leading-6">{region}</div>
                  <div className="flex text-xs text-gray-800 leading-4 items-center">
                    {loadingQuery ? <Spinner size="sm" style={{ borderWidth: "0.1em", marginRight: "0.5rem" }} /> : youngsByRegion.find((r) => r.key === region)?.doc_count || 0}
                    {` `}
                    volontaires
                  </div>
                </div>
                <div className="w-[45%]">coucou</div>
                <div className="w-[10%]">coucou</div>
              </div>
            </>
          ))}
        </div>
      </div>
    </>
  );
}
