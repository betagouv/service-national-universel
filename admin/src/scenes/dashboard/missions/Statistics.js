import React, { useEffect, useState } from "react";
import ProposedPlaces from "./ProposedPlaces";
import Status from "./status";
import MissionDetail from "./missionDetail";
import Period from "./Period";
import Format from "./Format";
import ProfessionalProject from "./ProfessionalProject";
import Mobility from "./Mobility";
import Volunteer from "./Volunteer";

import api from "../../../services/api";

export default ({ filter }) => {
  const [youngsDomains, setYoungsDomains] = useState({});
  const [youngsPeriod, setYoungsPeriod] = useState({});
  const [youngsFormat, setYoungsFormat] = useState({});
  const [youngsProfessionnalProject, setYoungsProfessionnalProject] = useState({});
  const [youngsProfessionnalProjectPrecision, setYoungsProfessionnalProjectPrecision] = useState({});
  const [youngsEngaged, setYoungsEngaged] = useState({});

  const [missionsStatus, setMissionsStatus] = useState({});
  const [missionsDomains, setMissionsDomains] = useState({});
  const [missionsPeriod, setMissionsPeriod] = useState({});
  const [missionsFormat, setMissionsFormat] = useState({});
  const [missionPlaceTotal, setMissionPlaceTotal] = useState(0);
  const [missionPlaceLeft, setMissionPlaceLeft] = useState(0);

  const [mobilityNearSchool, setMobilityNearSchool] = useState({});
  const [mobilityNearRelative, setMobilityNearRelative] = useState({});
  const [mobilityNearHome, setMobilityNearHome] = useState({});
  const [mobilityTransport, setMobilityTransport] = useState({});

  useEffect(() => {
    async function initStatus() {
      const queries = [];
      queries.push({ index: "mission", type: "_doc" });
      queries.push({
        query: { bool: { must: { match_all: {} }, filter: [] } },
        aggs: {
          status: { terms: { field: "status.keyword" } },
          domains: { terms: { field: "domains.keyword" } },
          period: { terms: { field: "period.keyword" } },
          format: { terms: { field: "format.keyword" } },
          placesTotal: { sum: { field: "placesTotal" } },
          placesLeft: { sum: { field: "placesLeft" } },
        },
        size: 0,
      });

      queries.push({ index: "young", type: "_doc" });
      queries.push({
        query: { bool: { must: { match_all: {} }, filter: [] } },
        aggs: {
          domains: { terms: { field: "domains.keyword" } },
          period: { terms: { field: "period.keyword" } },
          format: { terms: { field: "missionFormat.keyword" } },
          professionnalProject: { terms: { field: "professionnalProject.keyword" } },
          professionnalProjectPrecision: { terms: { field: "professionnalProjectPrecision.keyword" } },
          mobilityNearSchool: { terms: { field: "mobilityNearSchool.keyword" } },
          mobilityNearHome: { terms: { field: "mobilityNearHome.keyword" } },
          mobilityNearRelative: { terms: { field: "mobilityNearRelative.keyword" } },
          mobilityTransport: { terms: { field: "mobilityTransport.keyword" } },
          engaged: { terms: { field: "engaged.keyword" } },
        },
        size: 0,
      });

      if (filter.region) queries[1].query.bool.filter.push({ term: { "region.keyword": filter.region } });
      if (filter.department) queries[1].query.bool.filter.push({ term: { "department.keyword": filter.department } });
      if (filter.region) queries[3].query.bool.filter.push({ term: { "region.keyword": filter.region } });
      if (filter.department) queries[3].query.bool.filter.push({ term: { "department.keyword": filter.department } });

      const { responses } = await api.esQuery(queries);
      setMissionsStatus(responses[0].aggregations.status.buckets.reduce((acc, c) => ({ ...acc, [c.key]: c.doc_count }), {}));
      setMissionsDomains(responses[0].aggregations.domains.buckets.reduce((acc, c) => ({ ...acc, [c.key]: c.doc_count }), {}));
      setMissionsPeriod(responses[0].aggregations.period.buckets.reduce((acc, c) => ({ ...acc, [c.key]: c.doc_count }), {}));
      setMissionsFormat(responses[0].aggregations.format.buckets.reduce((acc, c) => ({ ...acc, [c.key]: c.doc_count }), {}));
      setMissionPlaceTotal(responses[0].aggregations.placesTotal.value);
      setMissionPlaceLeft(responses[0].aggregations.placesLeft.value);

      setMobilityNearSchool(responses[1].aggregations.mobilityNearSchool.buckets.reduce((acc, c) => ({ ...acc, [c.key]: c.doc_count }), {}));
      setMobilityNearHome(responses[1].aggregations.mobilityNearHome.buckets.reduce((acc, c) => ({ ...acc, [c.key]: c.doc_count }), {}));
      setMobilityNearRelative(responses[1].aggregations.mobilityNearRelative.buckets.reduce((acc, c) => ({ ...acc, [c.key]: c.doc_count }), {}));
      setYoungsDomains(responses[1].aggregations.domains.buckets.reduce((acc, c) => ({ ...acc, [c.key]: c.doc_count }), {}));
      setYoungsPeriod(responses[1].aggregations.period.buckets.reduce((acc, c) => ({ ...acc, [c.key]: c.doc_count }), {}));
      setYoungsProfessionnalProject(responses[1].aggregations.professionnalProject.buckets.reduce((acc, c) => ({ ...acc, [c.key]: c.doc_count }), {}));
      setYoungsEngaged(responses[1].aggregations.engaged.buckets.reduce((acc, c) => ({ ...acc, [c.key]: c.doc_count }), {}));
      setYoungsProfessionnalProjectPrecision(responses[1].aggregations.professionnalProjectPrecision.buckets.reduce((acc, c) => ({ ...acc, [c.key]: c.doc_count }), {}));
      setYoungsFormat(responses[1].aggregations.format.buckets.reduce((acc, c) => ({ ...acc, [c.key]: c.doc_count }), {}));
      setMobilityTransport(responses[1].aggregations.mobilityTransport.buckets.reduce((acc, c) => ({ ...acc, [c.key]: c.doc_count }), {}));
    }
    initStatus();
  }, [JSON.stringify(filter)]);

  const replaceSpaces = (v) => v.replace(/\s+/g, "+");

  const getLink = (link) => {
    if (filter.region) link += `&REGION=%5B"${replaceSpaces(filter.region)}"%5D`;
    if (filter.department) link += `&DEPARTMENT=%5B"${replaceSpaces(filter.department)}"%5D`;
    return link;
  };

  return (
    <React.Fragment>
      <ProposedPlaces getLink={getLink} missionPlaceLeft={missionPlaceLeft} missionPlaceTotal={missionPlaceTotal} />
      <Status getLink={getLink} data={missionsStatus} />
      <MissionDetail missionsDomains={missionsDomains} youngsDomains={youngsDomains} />
      <Period youngsPeriod={youngsPeriod} missionsPeriod={missionsPeriod} />
      <Format youngsFormat={youngsFormat} missionsFormat={missionsFormat} />
      <ProfessionalProject youngsProfessionnalProject={youngsProfessionnalProject} youngsProfessionnalProjectPrecision={youngsProfessionnalProjectPrecision} />
      <Mobility mobilityNearHome={mobilityNearHome} mobilityNearRelative={mobilityNearRelative} mobilityNearSchool={mobilityNearSchool} mobilityTransport={mobilityTransport} />
      <Volunteer youngsEngaged={youngsEngaged} />
    </React.Fragment>
  );
};
