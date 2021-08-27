import React, { useEffect, useState } from "react";
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
} from "../../../../utils";
import api from "../../../../services/api";
import Status from "./status";
import StatusMap from "./statusMap";
import Participation from "./participation";

export default ({ filter }) => {
  const [currentTab, setCurrentTab] = useState("global");
  const [status, setStatus] = useState({});
  const [statusPhase1, setStatusPhase1] = useState({});
  const [statusPhase2, setStatusPhase2] = useState({});
  const [statusPhase2Contract, setStatusPhase2Contract] = useState({});
  const [statusPhase3, setStatusPhase3] = useState({});
  const [cohesionStayPresence, setCohesionStayPresence] = useState({});
  const [statusApplication, setStatusApplication] = useState({});

  useEffect(() => {
    (async () => {
      const body = {
        query: { bool: { must: { match_all: {} }, filter: [{ term: { "cohort.keyword": filter.cohort } }, { terms: { "status.keyword": ["VALIDATED"] } }] } },
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

      if (filter.region) body.query.bool.filter.push({ term: { "region.keyword": filter.region } });
      if (filter.department) body.query.bool.filter.push({ term: { "department.keyword": filter.department } });

      const { responses } = await api.esQuery("young", body);

      body.query.bool.filter = [{ term: { "cohort.keyword": filter.cohort } }, { terms: { "status.keyword": ["WITHDRAWN"] } }];

      if (filter.region) body.query.bool.filter.push({ term: { "region.keyword": filter.region } });
      if (filter.department) body.query.bool.filter.push({ term: { "department.keyword": filter.department } });

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
        query: { bool: { must: { match_all: {} }, filter: [{ term: { "youngCohort.keyword": filter.cohort } }] } },
        aggs: {
          status: { terms: { field: "status.keyword" } },
        },
        size: 0,
      };

      if (filter.region) body.query.bool.filter.push({ terms: { "youngDepartment.keyword": region2department[filter.region] } });
      if (filter.department) body.query.bool.filter.push({ term: { "youngDepartment.keyword": filter.department } });

      const { responses } = await api.esQuery("application", body);
      if (responses.length) {
        setStatusApplication(responses[0].aggregations.status.buckets.reduce((acc, c) => ({ ...acc, [c.key]: c.doc_count }), {}));
      }
    })();
  }, [JSON.stringify(filter)]);

  const replaceSpaces = (v) => v.replace(/\s+/g, "+");
  const getLink = (link) => {
    if (filter.region) link += `&REGION=%5B"${replaceSpaces(filter.region)}"%5D`;
    if (filter.cohort) link += `&COHORT=%5B"${replaceSpaces(filter.cohort)}"%5D`;
    if (filter.department) link += `&DEPARTMENT=%5B"${replaceSpaces(filter.department)}"%5D`;
    return link;
  };

  return (
    <>
      <TabNavigation>
        <TabNavigationList>
          <TabItem onClick={() => setCurrentTab("global")} isActive={currentTab === "global"}>
            Général
          </TabItem>
          <TabItem onClick={() => setCurrentTab("phase1")} isActive={currentTab === "phase1"}>
            Phase 1
          </TabItem>
          <TabItem onClick={() => setCurrentTab("phase2")} isActive={currentTab === "phase2"}>
            Phase 2
          </TabItem>
          <TabItem onClick={() => setCurrentTab("phase3")} isActive={currentTab === "phase3"}>
            Phase 3
          </TabItem>
        </TabNavigationList>
      </TabNavigation>
      <Wrapper>
        {currentTab === "global" && (
          <>
            <SubTitle>En quelques chiffres</SubTitle>
            <Status status={status} statusPhase1={statusPhase1} statusPhase2={statusPhase2} statusPhase3={statusPhase3} getLink={getLink} />
          </>
        )}
        {currentTab === "phase1" && (
          <>
            <StatusMap
              sectionTitle="Phase 1"
              title="Statut"
              obj={YOUNG_STATUS_PHASE1}
              filterName="STATUS_PHASE_1"
              colors={YOUNG_STATUS_COLORS}
              data={statusPhase1}
              getLink={getLink}
            />
            <Participation data={cohesionStayPresence} getLink={getLink} />
          </>
        )}
        {currentTab === "phase2" && (
          <>
            <StatusMap
              sectionTitle="Phase 2"
              title="Statut"
              obj={YOUNG_STATUS_PHASE2}
              filterName="STATUS_PHASE_2"
              colors={YOUNG_STATUS_COLORS}
              data={statusPhase2}
              getLink={getLink}
            />
            <StatusMap
              title="Statut sur des contrats d'engagement"
              obj={CONTRACT_STATUS}
              filterName="CONTRACT_STATUS"
              colors={CONTRACT_STATUS_COLORS}
              data={statusPhase2Contract}
              getLink={getLink}
            />
            <StatusMap
              title="Statut sur une mission de phase 2"
              obj={APPLICATION_STATUS}
              filterName="APPLICATION_STATUS"
              colors={APPLICATION_STATUS_COLORS}
              data={statusApplication}
              getLink={getLink}
            />
          </>
        )}
        {currentTab === "phase3" && (
          <>
            <StatusMap
              sectionTitle="Phase 3"
              title="Statut"
              obj={YOUNG_STATUS_PHASE3}
              filterName="STATUS_PHASE_3"
              colors={YOUNG_STATUS_COLORS}
              data={statusPhase3}
              getLink={getLink}
            />
          </>
        )}
      </Wrapper>
    </>
  );
};

const SubTitle = styled.h3`
  color: #242526;
  font-size: 24px;
  margin-bottom: 1rem;
  margin-top: 1.5rem;
  font-weight: normal;
`;

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
