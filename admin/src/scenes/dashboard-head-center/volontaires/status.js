import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

import api from "../../../services/api";
import Phase1 from "./phase1";
import CohesionStayMedicalFileReceived from "./cohesionStayMedicalFileReceived";
import CohesionStayPresence from "./cohesionStayPresence";

export default ({ filter }) => {
  const [statusPhase1, setStatusPhase1] = useState({});
  const [cohesionStayMedicalFileReceived, setCohesionStayMedicalFileReceived] = useState({});
  const [cohesionStayPresence, setCohesionStayPresence] = useState({});

  const user = useSelector((state) => state.Auth.user);

  useEffect(() => {
    (async () => {
      const queries = [];
      queries.push({ index: "young", type: "_doc" });
      queries.push({
        query: {
          bool: {
            must: { match_all: {} },
            filter: [
              { term: { "cohort.keyword": filter.cohort } },
              { terms: { "status.keyword": ["VALIDATED", "WITHDRAWN"] } },
              { term: { "cohesionCenterId.keyword": user.cohesionCenterId } },
            ],
          },
        },
        aggs: {
          statusPhase1: { terms: { field: "statusPhase1.keyword" } },
          cohesionStayMedicalFileReceived: { terms: { field: "cohesionStayMedicalFileReceived.keyword" } },
          cohesionStayPresence: { terms: { field: "cohesionStayPresence.keyword" } },
        },
        size: 0,
      });

      if (filter.region) queries[1].query.bool.filter.push({ term: { "region.keyword": filter.region } });
      if (filter.department) queries[1].query.bool.filter.push({ term: { "department.keyword": filter.department } });

      const { responses } = await api.esQuery(queries);
      setStatusPhase1(responses[0].aggregations.statusPhase1.buckets.reduce((acc, c) => ({ ...acc, [c.key]: c.doc_count }), {}));
      addNullAttributes(responses[0].hits.total.value, responses[0].aggregations.cohesionStayMedicalFileReceived.buckets);
      setCohesionStayMedicalFileReceived(responses[0].aggregations.cohesionStayMedicalFileReceived.buckets.reduce((acc, c) => ({ ...acc, [c.key]: c.doc_count }), {}));
      addNullAttributes(responses[0].hits.total.value, responses[0].aggregations.cohesionStayPresence.buckets);
      setCohesionStayPresence(responses[0].aggregations.cohesionStayPresence.buckets.reduce((acc, c) => ({ ...acc, [c.key]: c.doc_count }), {}));
    })();
  }, [JSON.stringify(filter)]);

  const addNullAttributes = (total, buckets) => {
    if (buckets.find((obj) => obj.key === "")?.doc_count)
      buckets.find((obj) => obj.key === "").doc_count =
        total -
        buckets
          .filter((obj) => obj.key !== "")
          .reduce(function (acc, c) {
            return acc + c.doc_count;
          }, 0);
  };

  const replaceSpaces = (v) => v.replace(/\s+/g, "+");

  const getLink = (link) => {
    if (filter.region) link += `&REGION=%5B"${replaceSpaces(filter.region)}"%5D`;
    if (filter.cohort) link += `&COHORT=%5B"${replaceSpaces(filter.cohort)}"%5D`;
    if (filter.department) link += `&DEPARTMENT=%5B"${replaceSpaces(filter.department)}"%5D`;
    return link;
  };

  return (
    <>
      <Phase1 data={statusPhase1} getLink={getLink} />
      <CohesionStayMedicalFileReceived data={cohesionStayMedicalFileReceived} getLink={getLink} />
      <CohesionStayPresence data={cohesionStayPresence} getLink={getLink} />
    </>
  );
};
