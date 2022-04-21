import React, { useEffect, useState } from "react";
import { useParams, useHistory } from "react-router-dom";
import styled from "styled-components";
import {
  region2department,
  CONTRACT_STATUS_COLORS,
  CONTRACT_STATUS,
  APPLICATION_STATUS,
  APPLICATION_STATUS_COLORS,
  YOUNG_STATUS_COLORS,
  YOUNG_STATUS_PHASE1,
  YOUNG_STATUS_PHASE2,
  YOUNG_STATUS_PHASE3,
  getLink,
} from "../../../../utils";
import api from "../../../../services/api";
import Status from "./status";
import ChangementDeCohorte from "./changementDeCohorte";
import StatusMap from "./statusMap";
import Participation from "./participation";

export default function StatusIndex({ filter }) {
  const { currentSubtab } = useParams();
  const history = useHistory();

  const [status, setStatus] = useState({});
  const [statusPhase1, setStatusPhase1] = useState({});
  const [statusPhase2, setStatusPhase2] = useState({});
  const [statusPhase2Contract, setStatusPhase2Contract] = useState({});
  const [statusPhase3, setStatusPhase3] = useState({});
  const [youngWhoChangedCohortIn, setYoungWhoChangedCohortIn] = useState({});
  const [youngWhoChangedCohortOut, setYoungWhoChangedCohortOut] = useState({});
  const [cohesionStayPresence, setCohesionStayPresence] = useState({});
  const [statusApplication, setStatusApplication] = useState({});

  useEffect(() => {
    const listTab = ["général", "phase1", "phase2", "phase3", "centres"];
    if (!listTab.includes(currentSubtab)) history.push(`/dashboard/volontaires/général`);
  }, [currentSubtab]);

  useEffect(() => {
    (async () => {
      const body = {
        query: { bool: { must: { match_all: {} }, filter: [] } },
        aggs: {
          status: { terms: { field: "status.keyword" } },
          statusPhase1: { terms: { field: "statusPhase1.keyword" } },
          statusPhase2: { terms: { field: "statusPhase2.keyword" } },
          statusPhase2Contract: { terms: { field: "statusPhase2Contract.keyword" } },
          statusPhase3: { terms: { field: "statusPhase3.keyword" } },
          cohesionStayPresence: { terms: { field: "cohesionStayPresence.keyword" } },
        },
        size: 0,
      };

      if (filter.cohort?.length) body.query.bool.filter.push({ terms: { "cohort.keyword": filter.cohort } });
      if (filter.region?.length) body.query.bool.filter.push({ terms: { "region.keyword": filter.region } });
      if (filter.department?.length) body.query.bool.filter.push({ terms: { "department.keyword": filter.department } });
      if (filter.status?.length) body.query.bool.filter.push({ terms: { "status.keyword": filter.status } });

      const { responses } = await api.esQuery("young", body);

      body.query.bool.filter = [{ terms: { "status.keyword": ["WITHDRAWN"] } }];

      if (filter.cohort?.length) body.query.bool.filter.push({ terms: { "cohort.keyword": filter.cohort } });
      if (filter.region?.length) body.query.bool.filter.push({ terms: { "region.keyword": filter.region } });
      if (filter.department?.length) body.query.bool.filter.push({ terms: { "department.keyword": filter.department } });

      const { responses: responses2 } = await api.esQuery("young", body);

      if (responses.length && responses2.length) {
        setStatus({
          VALIDATED: responses[0].aggregations.status.buckets.reduce((acc, c) => acc + c.doc_count, 0),
          WITHDRAWN: responses2[0].aggregations.status.buckets.reduce((acc, c) => acc + c.doc_count, 0),
        });
        setStatusPhase1(responses[0].aggregations.statusPhase1.buckets.reduce((acc, c) => ({ ...acc, [c.key]: c.doc_count }), {}));
        setStatusPhase2(responses[0].aggregations.statusPhase2.buckets.reduce((acc, c) => ({ ...acc, [c.key]: c.doc_count }), {}));
        setStatusPhase2Contract(responses[0].aggregations.statusPhase2Contract.buckets.reduce((acc, c) => ({ ...acc, [c.key]: c.doc_count }), {}));
        setStatusPhase3(responses[0].aggregations.statusPhase3.buckets.reduce((acc, c) => ({ ...acc, [c.key]: c.doc_count }), {}));
        setCohesionStayPresence(responses[0].aggregations.cohesionStayPresence.buckets.reduce((acc, c) => ({ ...acc, [c.key]: c.doc_count }), {}));
      }
    })();

    (async () => {
      const body = {
        query: { bool: { must: { match_all: {} }, filter: [] } },
        aggs: {
          status: { terms: { field: "status.keyword" } },
        },
        size: 0,
      };

      if (filter.cohort?.length) body.query.bool.filter.push({ terms: { "youngCohort.keyword": filter.cohort } });
      if (filter.region?.length) {
        const departmentQuery = filter.region?.reduce((previous, current) => previous?.concat(region2department[current]), []);
        body.query.bool.filter.push({ terms: { "youngDepartment.keyword": departmentQuery } });
      }
      if (filter.department?.length) body.query.bool.filter.push({ terms: { "youngDepartment.keyword": filter.department } });

      const { responses } = await api.esQuery("application", body);
      if (responses.length) {
        setStatusApplication(responses[0].aggregations.status.buckets.reduce((acc, c) => ({ ...acc, [c.key]: c.doc_count }), {}));
      }
    })();
  }, [JSON.stringify(filter)]);

  useEffect(() => {
    (async () => {
      const body = {
        query: {
          bool: {
            must: { match_all: {} },
            filter: [
              {
                exists: {
                  field: "originalCohort",
                },
              },
            ],
          },
        },
        aggs: {
          cohort: { terms: { field: "cohort.keyword" } },
        },
        size: 0,
      };

      if (filter.cohort?.length) body.query.bool.filter.push({ terms: { "cohort.keyword": filter.cohort } });
      if (filter.region?.length) body.query.bool.filter.push({ terms: { "region.keyword": filter.region } });
      if (filter.department?.length) body.query.bool.filter.push({ terms: { "department.keyword": filter.department } });
      if (filter.status?.length) body.query.bool.filter.push({ terms: { "status.keyword": filter.status } });

      const { responses } = await api.esQuery("young", body);
      if (responses?.length) {
        setYoungWhoChangedCohortIn(responses[0].aggregations.cohort.buckets.reduce((acc, c) => ({ ...acc, [c.key]: c.doc_count }), {}));
      }
    })();
  }, [JSON.stringify(filter)]);

  useEffect(() => {
    (async () => {
      const body = {
        query: {
          bool: {
            must: { match_all: {} },
            filter: [
              {
                exists: {
                  field: "originalCohort",
                },
              },
            ],
          },
        },
        aggs: {
          originalCohort: { terms: { field: "originalCohort.keyword" } },
        },
        size: 0,
      };

      if (filter.cohort?.length) body.query.bool.filter.push({ terms: { "originalCohort.keyword": filter.cohort } });
      if (filter.region?.length) body.query.bool.filter.push({ terms: { "region.keyword": filter.region } });
      if (filter.department?.length) body.query.bool.filter.push({ terms: { "department.keyword": filter.department } });
      if (filter.status?.length) body.query.bool.filter.push({ terms: { "status.keyword": filter.status } });

      const { responses } = await api.esQuery("young", body);
      if (responses?.length) {
        setYoungWhoChangedCohortOut(responses[0].aggregations.originalCohort.buckets.reduce((acc, c) => ({ ...acc, [c.key]: c.doc_count }), {}));
      }
    })();
  }, [JSON.stringify(filter)]);

  return (
    <>
      <TabNavigation>
        <TabNavigationList>
          <TabItem onClick={() => history.push(`/dashboard/volontaires/général`, { params: { filter } })} isActive={currentSubtab === "général"}>
            Général
          </TabItem>
          <TabItem onClick={() => history.push(`/dashboard/volontaires/phase1`, { params: { filter } })} isActive={currentSubtab === "phase1"}>
            Phase 1
          </TabItem>
          <TabItem onClick={() => history.push(`/dashboard/volontaires/phase2`, { params: { filter } })} isActive={currentSubtab === "phase2"}>
            Phase 2
          </TabItem>
          <TabItem onClick={() => history.push(`/dashboard/volontaires/phase3`, { params: { filter } })} isActive={currentSubtab === "phase3"}>
            Phase 3
          </TabItem>
        </TabNavigationList>
      </TabNavigation>
      <Wrapper>
        {currentSubtab === "général" && (
          <>
            <h3 className="mt-4 mb-2 text-xl">En quelques chiffres</h3>
            <Status status={status} statusPhase1={statusPhase1} statusPhase2={statusPhase2} statusPhase3={statusPhase3} filter={filter} getLink={getLink} />
            <ChangementDeCohorte youngWhoChangedCohortIn={youngWhoChangedCohortIn} youngWhoChangedCohortOut={youngWhoChangedCohortOut} filter={filter} />
          </>
        )}
        {currentSubtab === "phase1" && (
          <>
            <StatusMap
              sectionTitle="Phase 1"
              title="Statut"
              obj={YOUNG_STATUS_PHASE1}
              filterName="STATUS_PHASE_1"
              colors={YOUNG_STATUS_COLORS}
              data={statusPhase1}
              filter={filter}
              getLink={getLink}
            />
            <Participation data={cohesionStayPresence} filter={filter} getLink={getLink} />
          </>
        )}
        {currentSubtab === "phase2" && (
          <>
            <StatusMap
              sectionTitle="Phase 2"
              title="Statut"
              obj={YOUNG_STATUS_PHASE2}
              filterName="STATUS_PHASE_2"
              colors={YOUNG_STATUS_COLORS}
              data={statusPhase2}
              filter={filter}
              getLink={getLink}
            />
            <StatusMap
              title="Statut des contrats d'engagement"
              obj={CONTRACT_STATUS}
              filterName="CONTRACT_STATUS"
              colors={CONTRACT_STATUS_COLORS}
              data={statusPhase2Contract}
              filter={filter}
              getLink={getLink}
            />
            <StatusMap
              title="Statut sur une mission de phase 2"
              obj={APPLICATION_STATUS}
              filterName="APPLICATION_STATUS"
              colors={APPLICATION_STATUS_COLORS}
              data={statusApplication}
              filter={filter}
              getLink={getLink}
            />
          </>
        )}
        {currentSubtab === "phase3" && (
          <>
            <StatusMap
              sectionTitle="Phase 3"
              title="Statut"
              obj={YOUNG_STATUS_PHASE3}
              filterName="STATUS_PHASE_3"
              colors={YOUNG_STATUS_COLORS}
              data={statusPhase3}
              filter={filter}
              getLink={getLink}
            />
          </>
        )}
      </Wrapper>
    </>
  );
}

const Wrapper = styled.div`
  padding: 1.5rem;
  @media print {
    background-color: #fff;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    padding: 2rem;
    z-index: 999;
  }
`;
const TabNavigation = styled.nav`
  /* padding: 1.5rem; */
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
`;
const TabNavigationList = styled.ul`
  padding-left: 30px;
  display: flex;
  list-style-type: none;
`;
const TabItem = styled.li`
  padding: 16px;
  position: relative;
  font-size: 0.9rem;
  color: #979797;
  cursor: pointer;
  :hover {
    color: #aaa;
    &:after {
      content: "";
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 4px;
      background-color: #aaa;
      border-top-left-radius: 4px;
      border-top-right-radius: 4px;
    }
  }

  ${(props) =>
    props.isActive &&
    `
    color: #5245CC;
    font-weight: bold;

    &:after {
      content: "";
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 4px;
      background-color: #5245CC;
      border-top-left-radius: 4px;
      border-top-right-radius: 4px;
    }
  `}
`;
