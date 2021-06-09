import React, { useEffect, useState } from "react";
import { Col, Row } from "reactstrap";
import { Link } from "react-router-dom";
import {
  translate,
  YOUNG_STATUS_COLORS,
  YOUNG_STATUS_PHASE2,
  CONTRACT_STATUS,
  CONTRACT_STATUS_COLORS,
  YOUNG_STATUS_PHASE1,
  APPLICATION_STATUS,
  APPLICATION_STATUS_COLORS,
  YOUNG_STATUS_PHASE3,
} from "../../../utils";
import api from "../../../services/api";
import { CardArrow, Card, CardTitle, CardValueWrapper, CardValue, CardPercentage, CardSection, Subtitle } from "../../../components/dashboard";

export default ({ filter }) => {
  const [status, setStatus] = useState({});
  const [statusPhase1, setStatusPhase1] = useState({});
  const [statusPhase2, setStatusPhase2] = useState({});
  const [statusPhase2Contract, setStatusPhase2Contract] = useState({});
  const [statusPhase3, setStatusPhase3] = useState({});
  const [cohesionStayPresence, setCohesionStayPresence] = useState({});
  const [statusApplication, setStatusApplication] = useState({});

  useEffect(() => {
    (async () => {
      const queries = [];
      queries.push({ index: "young", type: "_doc" });
      queries.push({
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
      });

      if (filter.region) queries[1].query.bool.filter.push({ term: { "region.keyword": filter.region } });
      if (filter.department) queries[1].query.bool.filter.push({ term: { "department.keyword": filter.department } });

      const { responses } = await api.esQuery(queries);

      const queries2 = [...queries];
      queries2[1].query.bool.filter = [{ term: { "cohort.keyword": filter.cohort } }, { terms: { "status.keyword": ["WITHDRAWN"] } }];
      if (filter.region) queries2[1].query.bool.filter.push({ term: { "region.keyword": filter.region } });
      if (filter.department) queries2[1].query.bool.filter.push({ term: { "department.keyword": filter.department } });
      const { responses: responses2 } = await api.esQuery(queries2);

      setStatus({
        VALIDATED: responses[0].aggregations.status.buckets.reduce((acc, c) => acc + c.doc_count, 0),
        WITHDRAWN: responses2[0].aggregations.status.buckets.reduce((acc, c) => acc + c.doc_count, 0),
      });
      setStatusPhase1(responses[0].aggregations.statusPhase1.buckets.reduce((acc, c) => ({ ...acc, [c.key]: c.doc_count }), {}));
      setStatusPhase2(responses[0].aggregations.statusPhase2.buckets.reduce((acc, c) => ({ ...acc, [c.key]: c.doc_count }), {}));
      setStatusPhase2Contract(responses[0].aggregations.statusPhase2Contract.buckets.reduce((acc, c) => ({ ...acc, [c.key]: c.doc_count }), {}));
      setStatusPhase3(responses[0].aggregations.statusPhase3.buckets.reduce((acc, c) => ({ ...acc, [c.key]: c.doc_count }), {}));
      setCohesionStayPresence(responses[0].aggregations.cohesionStayPresence.buckets.reduce((acc, c) => ({ ...acc, [c.key]: c.doc_count }), {}));
    })();
    (async () => {
      const queries = [];
      queries.push({ index: "application", type: "_doc" });
      queries.push({
        query: { bool: { must: { match_all: {} }, filter: [{ term: { "youngCohort.keyword": filter.cohort } }] } },
        aggs: {
          status: { terms: { field: "status.keyword" } },
        },
        size: 0,
      });

      if (filter.region) queries[1].query.bool.filter.push({ term: { "youngRegion.keyword": filter.region } });
      if (filter.department) queries[1].query.bool.filter.push({ term: { "youngDepartment.keyword": filter.department } });

      const { responses } = await api.esQuery(queries);
      setStatusApplication(responses[0].aggregations.status.buckets.reduce((acc, c) => ({ ...acc, [c.key]: c.doc_count }), {}));
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
      <Status status={status} statusPhase1={statusPhase1} statusPhase2={statusPhase2} statusPhase3={statusPhase3} getLink={getLink} />
      <hr />
      <Phase1 data={statusPhase1} getLink={getLink} />
      <Participation data={cohesionStayPresence} getLink={getLink} />
      <hr />
      <Phase2 data={statusPhase2} getLink={getLink} />
      <Contract data={statusPhase2Contract} getLink={getLink} />
      <Application data={statusApplication} getLink={getLink} />
      <hr />
      <Phase3 data={statusPhase3} getLink={getLink} />
    </>
  );
};

const Status = ({ status, statusPhase1, statusPhase2, statusPhase3, getLink }) => {
  const total = Object.keys(status).reduce((acc, a) => acc + status[a], 0);

  return (
    <React.Fragment>
      <Row>
        <Col md={6} xl={4}>
          <Link to={getLink(`/volontaire?STATUS=%5B"VALIDATED"%5D`)}>
            <Card borderBottomColor={YOUNG_STATUS_COLORS.IN_PROGRESS}>
              <CardTitle>Volontaires</CardTitle>
              <CardValueWrapper>
                <CardValue>{status.VALIDATED || 0}</CardValue>
                <CardPercentage>
                  {total ? `${(((status.VALIDATED || 0) * 100) / total).toFixed(0)}%` : `0%`}
                  <CardArrow />
                </CardPercentage>
              </CardValueWrapper>
            </Card>
          </Link>
        </Col>
      </Row>
      <Row>
        <Col md={6} xl={4}>
          <Link to={getLink(`/volontaire?STATUS_PHASE_1=%5B"DONE"%5D`)}>
            <Card borderBottomColor={YOUNG_STATUS_COLORS.VALIDATED}>
              <CardTitle>Ayant validé la Phase 1</CardTitle>
              <CardValueWrapper>
                <CardValue>{statusPhase1.DONE || 0}</CardValue>
                <CardPercentage>
                  {total ? `${(((statusPhase1.DONE || 0) * 100) / total).toFixed(0)}%` : `0%`}
                  <CardArrow />
                </CardPercentage>
              </CardValueWrapper>
            </Card>
          </Link>
        </Col>
        <Col md={6} xl={4}>
          <Link to={getLink(`/volontaire?STATUS_PHASE_2=%5B"VALIDATED"%5D`)}>
            <Card borderBottomColor={YOUNG_STATUS_COLORS.VALIDATED}>
              <CardTitle>Ayant validé la Phase 2</CardTitle>
              <CardValueWrapper>
                <CardValue>{statusPhase2.VALIDATED || 0}</CardValue>
                <CardPercentage>
                  {total ? `${(((statusPhase2.VALIDATED || 0) * 100) / total).toFixed(0)}%` : `0%`}
                  <CardArrow />
                </CardPercentage>
              </CardValueWrapper>
            </Card>
          </Link>
        </Col>
        <Col md={6} xl={4}>
          <Card borderBottomColor={YOUNG_STATUS_COLORS.VALIDATED}>
            <CardTitle>Ayant validé la Phase 3</CardTitle>
            <CardValueWrapper>
              <CardValue>{statusPhase3.VALIDATED || 0}</CardValue>
              <CardPercentage>
                {total ? `${(((statusPhase3.VALIDATED || 0) * 100) / total).toFixed(0)}%` : `0%`}
                <CardArrow />
              </CardPercentage>
            </CardValueWrapper>
          </Card>
        </Col>
      </Row>
      <Row>
        <Col md={6} xl={4}>
          <Link to={getLink(`/volontaire?STATUS=%5B"WITHDRAWN"%5D`)}>
            <Card borderBottomColor={YOUNG_STATUS_COLORS.WITHDRAWN}>
              <CardTitle>Désistés</CardTitle>
              <CardValueWrapper>
                <CardValue>{status.WITHDRAWN || 0}</CardValue>
                <CardPercentage>
                  {total ? `${(((status.WITHDRAWN || 0) * 100) / total).toFixed(0)}%` : `0%`}
                  <CardArrow />
                </CardPercentage>
              </CardValueWrapper>
            </Card>
          </Link>
        </Col>
      </Row>
    </React.Fragment>
  );
};

const Phase3 = ({ data, getLink }) => {
  const total = Object.keys(data).reduce((acc, a) => acc + data[a], 0);
  return (
    <React.Fragment>
      <Row>
        <Col md={12}>
          <CardSection>Phase 3</CardSection>
          <Subtitle>Statut</Subtitle>
        </Col>
      </Row>
      <Row>
        {Object.values(YOUNG_STATUS_PHASE3).map((e) => {
          return (
            <Col md={6} xl={4} key={e}>
              <Link to={getLink(`/volontaire?STATUS_PHASE_3=%5B"${e}"%5D`)}>
                <Card borderBottomColor={YOUNG_STATUS_COLORS[e]}>
                  <CardTitle>{translate(e)}</CardTitle>
                  <CardValueWrapper>
                    <CardValue>{data[e] || 0}</CardValue>
                    <CardPercentage>
                      {total ? `${(((data[e] || 0) * 100) / total).toFixed(0)}%` : `0%`}
                      <CardArrow />
                    </CardPercentage>
                  </CardValueWrapper>
                </Card>
              </Link>
            </Col>
          );
        })}
      </Row>
    </React.Fragment>
  );
};
const Phase2 = ({ data, getLink }) => {
  const total = Object.keys(data).reduce((acc, a) => acc + data[a], 0);
  return (
    <React.Fragment>
      <Row>
        <Col md={12}>
          <CardSection>Phase 2</CardSection>
          <Subtitle>Statut</Subtitle>
        </Col>
      </Row>
      <Row>
        {Object.values(YOUNG_STATUS_PHASE2).map((e) => {
          return (
            <Col md={6} xl={4} key={e}>
              <Link to={getLink(`/volontaire?STATUS_PHASE_2=%5B"${e}"%5D`)}>
                <Card borderBottomColor={YOUNG_STATUS_COLORS[e]}>
                  <CardTitle>{translate(e)}</CardTitle>
                  <CardValueWrapper>
                    <CardValue>{data[e] || 0}</CardValue>
                    <CardPercentage>
                      {total ? `${(((data[e] || 0) * 100) / total).toFixed(0)}%` : `0%`}
                      <CardArrow />
                    </CardPercentage>
                  </CardValueWrapper>
                </Card>
              </Link>
            </Col>
          );
        })}
      </Row>
    </React.Fragment>
  );
};
const Contract = ({ data, getLink }) => {
  const total = Object.keys(data).reduce((acc, a) => acc + data[a], 0);
  return (
    <React.Fragment>
      <Row>
        <Col md={12}>
          <Subtitle>Statut sur des contrats d'engagement</Subtitle>
        </Col>
      </Row>
      <Row>
        {Object.values(CONTRACT_STATUS).map((e) => {
          return (
            <Col md={6} xl={4} key={e}>
              <Link to={getLink(`/volontaire?CONTRACT_STATUS=%5B"${e}"%5D`)}>
                <Card borderBottomColor={CONTRACT_STATUS_COLORS[e]}>
                  <CardTitle>{translate(e)}</CardTitle>
                  <CardValueWrapper>
                    <CardValue>{data[e] || 0}</CardValue>
                    <CardPercentage>
                      {total ? `${(((data[e] || 0) * 100) / total).toFixed(0)}%` : `0%`}
                      <CardArrow />
                    </CardPercentage>
                  </CardValueWrapper>
                </Card>
              </Link>
            </Col>
          );
        })}
      </Row>
    </React.Fragment>
  );
};
const Application = ({ data, getLink }) => {
  const total = Object.keys(data).reduce((acc, e) => data[e] + acc, 0);
  return (
    <React.Fragment>
      <Row>
        <Col md={12}>
          <Subtitle>Statut sur une mission de phase 2</Subtitle>
        </Col>
      </Row>
      <Row>
        {Object.values(APPLICATION_STATUS).map((e) => {
          return (
            <Col md={6} xl={4} key={e}>
              <Link to={getLink(`/volontaire?STATUS_APPLICATION=%5B"${e}"%5D`)}>
                <Card borderBottomColor={APPLICATION_STATUS_COLORS[e]}>
                  <CardTitle>{translate(e)}</CardTitle>
                  <CardValueWrapper>
                    <CardValue>{data[e] || 0}</CardValue>
                    <CardPercentage>
                      {total ? `${(((data[e] || 0) * 100) / total).toFixed(0)}%` : `0%`}
                      <CardArrow />
                    </CardPercentage>
                  </CardValueWrapper>
                </Card>
              </Link>
            </Col>
          );
        })}
      </Row>
    </React.Fragment>
  );
};

const Phase1 = ({ data, getLink }) => {
  const total = Object.keys(data).reduce((acc, a) => acc + data[a], 0);

  return (
    <React.Fragment>
      <Row>
        <Col md={12}>
          <CardSection>Phase 1</CardSection>
          <Subtitle>Statut</Subtitle>
        </Col>
      </Row>
      <Row>
        {Object.values(YOUNG_STATUS_PHASE1).map((e) => {
          return (
            <Col md={6} xl={4} key={e}>
              <Link to={getLink(`/volontaire?STATUS_PHASE_1=%5B"${e}"%5D`)}>
                <Card borderBottomColor={YOUNG_STATUS_COLORS[e]}>
                  <CardTitle>{translate(e)}</CardTitle>
                  <CardValueWrapper>
                    <CardValue>{data[e] || 0}</CardValue>
                    <CardPercentage>
                      {total ? `${(((data[e] || 0) * 100) / total).toFixed(0)}%` : `0%`}
                      <CardArrow />
                    </CardPercentage>
                  </CardValueWrapper>
                </Card>
              </Link>
            </Col>
          );
        })}
      </Row>
    </React.Fragment>
  );
};

const Participation = ({ data, getLink }) => {
  const total = Object.keys(data).reduce((acc, a) => acc + data[a], 0);
  return (
    <React.Fragment>
      <Subtitle>Participations au séjour de cohésion</Subtitle>
      <Row>
        <Col md={6} xl={3} k="cohesionStayPresence_true">
          <Link to={getLink(`/volontaire`)}>
            <Card borderBottomColor="#6BC663">
              <CardTitle>Présent au séjour de cohésion</CardTitle>
              <CardValueWrapper>
                <CardValue>{data["true"] || 0}</CardValue>
                <CardPercentage>
                  {total ? `${(((data["true"] || 0) * 100) / total).toFixed(0)}%` : `0%`}
                  <CardArrow />
                </CardPercentage>
              </CardValueWrapper>
            </Card>
          </Link>
        </Col>
        <Col md={6} xl={3} k="cohesionStayPresence_false">
          <Link to={getLink(`/volontaire`)}>
            <Card borderBottomColor="#EF4036">
              <CardTitle>Absent au séjour de cohésion</CardTitle>
              <CardValueWrapper>
                <CardValue>{data["false"] || 0}</CardValue>
                <CardPercentage>
                  {total ? `${(((data["false"] || 0) * 100) / total).toFixed(0)}%` : `0%`}
                  <CardArrow />
                </CardPercentage>
              </CardValueWrapper>
            </Card>
          </Link>
        </Col>
      </Row>
    </React.Fragment>
  );
};
