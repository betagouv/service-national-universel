import React, { useEffect, useState } from "react";
import api from "../../../services/api";
import CohesionStayMedicalFileReceived from "./cohesionStayMedicalFileReceived";
import Participation from "./participation";
import Phase1 from "./phase1";
import { useSelector } from "react-redux";

export default function Status({ filter }) {
  const [statusPhase1, setStatusPhase1] = useState({});
  const [cohesionStayMedicalFileReceived, setCohesionStayMedicalFileReceived] = useState({});
  const [cohesionStayPresence, setCohesionStayPresence] = useState({});
  const [youngPhase1Agreement, setYoungPhase1Agreement] = useState({});
  const [departInform, setDepartInform] = useState({});
  const [departSejourMotif, setDepartSejourMotif] = useState({});
  const [presenceJDM, setPresenceJDM] = useState({});
  const [status, setStatus] = useState({});
  const [totalHit, setTotalHit] = useState();

  const { sessionPhase1 } = useSelector((state) => state.Auth);

  useEffect(() => {
    (async () => {
      const body = {
        query: {
          bool: {
            must: { match_all: {} },
            filter: [{ terms: { "status.keyword": ["VALIDATED"] } }],
          },
        },
        aggs: {
          statusPhase1: { terms: { field: "statusPhase1.keyword" } },
          cohesionStayMedicalFileReceived: { terms: { field: "cohesionStayMedicalFileReceived.keyword" } },
          cohesionStayPresence: { terms: { field: "cohesionStayPresence.keyword" } },
          youngPhase1Agreement: { terms: { field: "youngPhase1Agreement.keyword" } },
          presenceJDM: { terms: { field: "presenceJDM.keyword" } },
          departInform: { terms: { field: "departInform.keyword" } },
          departSejourMotif: { terms: { field: "departSejourMotif.keyword" } },
        },
        track_total_hits: true,
        size: 0,
      };

      const body2 = {
        query: {
          bool: {
            must: { match_all: {} },
            filter: [{ terms: { "status.keyword": ["WITHDRAWN"] } }],
          },
        },
        aggs: {
          status: { terms: { field: "status.keyword" } },
        },
        track_total_hits: true,
        size: 0,
      };

      if (filter.cohort?.length) {
        body.query.bool.filter.push({ terms: { "cohort.keyword": filter.cohort } });
        body2.query.bool.filter.push({ terms: { "cohort.keyword": filter.cohort } });
      }
      if (filter.region?.length) {
        body.query.bool.filter.push({ terms: { "region.keyword": filter.region } });
        body2.query.bool.filter.push({ terms: { "region.keyword": filter.region } });
      }
      if (filter.department?.length) {
        body.query.bool.filter.push({ terms: { "department.keyword": filter.department } });
        body2.query.bool.filter.push({ terms: { "department.keyword": filter.department } });
      }

      const { responses } = await api.esQuery("young", body);
      const { responses: responses2 } = await api.esQuery("young", body2);

      if (responses?.length) {
        setStatusPhase1(responses[0].aggregations.statusPhase1.buckets.reduce((acc, c) => ({ ...acc, [c.key]: c.doc_count }), {}));
        addNullAttributes(responses[0].hits.total.value, responses[0].aggregations.cohesionStayMedicalFileReceived.buckets);
        setCohesionStayMedicalFileReceived(responses[0].aggregations.cohesionStayMedicalFileReceived.buckets.reduce((acc, c) => ({ ...acc, [c.key]: c.doc_count }), {}));
        addNullAttributes(responses[0].hits.total.value, responses[0].aggregations.cohesionStayPresence.buckets);
        setCohesionStayPresence(responses[0].aggregations.cohesionStayPresence.buckets.reduce((acc, c) => ({ ...acc, [c.key]: c.doc_count }), {}));
        setYoungPhase1Agreement(responses[0].aggregations.youngPhase1Agreement.buckets.reduce((acc, c) => ({ ...acc, [c.key]: c.doc_count }), {}));
        setPresenceJDM(responses[0].aggregations.presenceJDM.buckets.reduce((acc, c) => ({ ...acc, [c.key]: c.doc_count }), {}));
        setDepartInform(responses[0].aggregations.departInform.buckets.reduce((acc, c) => ({ ...acc, [c.key]: c.doc_count }), {}));
        setDepartSejourMotif(responses[0].aggregations.departSejourMotif.buckets.reduce((acc, c) => ({ ...acc, [c.key]: c.doc_count }), {}));
        setTotalHit(responses[0].hits.total.value);
      }

      if (responses2?.length) {
        setStatus(responses2[0].aggregations.status.buckets.reduce((acc, c) => ({ ...acc, [c.key]: c.doc_count }), {}));
      }
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

  const getLink = (link) => {
    return link;
  };

  console.log(status);

  return (
    <>
      <Phase1 data={statusPhase1} status={status} getLink={getLink} sessionPhase1Id={sessionPhase1?._id} centerId={sessionPhase1?.cohesionCenterId} />
      <CohesionStayMedicalFileReceived data={cohesionStayMedicalFileReceived} getLink={getLink} sessionPhase1Id={sessionPhase1?._id} centerId={sessionPhase1?.cohesionCenterId} />
      <Participation
        cohesionStayPresence={cohesionStayPresence}
        youngPhase1Agreement={youngPhase1Agreement}
        filter={filter}
        total={totalHit}
        getLink={getLink}
        presenceJDM={presenceJDM}
        departInform={departInform}
        departSejourMotif={departSejourMotif}
        sessionPhase1Id={sessionPhase1?._id}
        centerId={sessionPhase1?.cohesionCenterId}
      />
    </>
  );
}
