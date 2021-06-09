import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { Col, Row } from "reactstrap";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { YOUNG_STATUS_COLORS } from "../../../utils";

import api from "../../../services/api";
import CardArrowDashboard from "../../../components/CardArrowDashboard";

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
      console.log(responses[0].aggregations);
      setStatusPhase1(responses[0].aggregations.statusPhase1.buckets.reduce((acc, c) => ({ ...acc, [c.key]: c.doc_count }), {}));
      setCohesionStayMedicalFileReceived(responses[0].aggregations.cohesionStayMedicalFileReceived.buckets.reduce((acc, c) => ({ ...acc, [c.key]: c.doc_count }), {}));
      setCohesionStayPresence(responses[0].aggregations.cohesionStayPresence.buckets.reduce((acc, c) => ({ ...acc, [c.key]: c.doc_count }), {}));
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
      <Phase1 data={statusPhase1} getLink={getLink} />
      <CohesionStayMedicalFileReceived data={cohesionStayMedicalFileReceived} getLink={getLink} />
      <CohesionStayPresence data={cohesionStayPresence} getLink={getLink} />
    </>
  );
};

const Phase1 = ({ data, getLink }) => {
  console.log(data);
  return (
    <>
      <Row>
        <Col md={12}>
          <CardSection>Phase 1</CardSection>
          <CardSubtitle>Statuts</CardSubtitle>
        </Col>
      </Row>
      <Row>
        <Col md={6} xl={2}>
          <Link to={getLink('/volontaire?STATUS_PHASE_1=%5B"AFFECTED"%5D')}>
            <Card borderBottomColor={YOUNG_STATUS_COLORS.AFFECTED}>
              <CardTitle>Affectée</CardTitle>
              <CardValueWrapper>
                <CardValue>{data.AFFECTED || 0}</CardValue>
                <CardArrowDashboard />
              </CardValueWrapper>
            </Card>
          </Link>
        </Col>
        <Col md={6} xl={2}>
          <Link to={getLink('/volontaire?STATUS_PHASE_1=%5B"CANCEL"%5D')}>
            <Card borderBottomColor={YOUNG_STATUS_COLORS.CANCEL}>
              <CardTitle>Annulée</CardTitle>
              <CardValueWrapper>
                <CardValue>{data.CANCEL || 0}</CardValue>
                <CardArrowDashboard />
              </CardValueWrapper>
            </Card>
          </Link>
        </Col>
        <Col md={6} xl={2}>
          <Link to={getLink('/volontaire?STATUS_PHASE_1=%5B"AFFECTED"%5D')}>
            <Card borderBottomColor={YOUNG_STATUS_COLORS.DONE}>
              <CardTitle>Réalisée</CardTitle>
              <CardValueWrapper>
                <CardValue>{data.DONE || 0}</CardValue>
                <CardArrowDashboard />
              </CardValueWrapper>
            </Card>
          </Link>
        </Col>
        <Col md={6} xl={2}>
          <Link to={getLink('/volontaire?STATUS_PHASE_1=%5B"AFFECTED"%5D')}>
            <Card borderBottomColor={YOUNG_STATUS_COLORS.NOT_DONE}>
              <CardTitle>Non réalisée</CardTitle>
              <CardValueWrapper>
                <CardValue>{data.NOT_DONE || 0}</CardValue>
                <CardArrowDashboard />
              </CardValueWrapper>
            </Card>
          </Link>
        </Col>
        <Col md={6} xl={2}>
          <Link to={getLink('/volontaire?STATUS_PHASE_1=%5B"WAITING_LIST"%5D')}>
            <Card borderBottomColor={YOUNG_STATUS_COLORS.WAITING_LIST}>
              <CardTitle>Sur liste complémentaire</CardTitle>
              <CardValueWrapper>
                <CardValue>{data.WAITING_LIST || 0}</CardValue>
                <CardArrowDashboard />
              </CardValueWrapper>
            </Card>
          </Link>
        </Col>
        <Col md={6} xl={2}>
          <Link to={getLink('/volontaire?STATUS_PHASE_1=%5B"WITHDRAWN"%5D')}>
            <Card borderBottomColor={YOUNG_STATUS_COLORS.WITHDRAWN}>
              <CardTitle>Désistée</CardTitle>
              <CardValueWrapper>
                <CardValue>{data.WITHDRAWN || 0}</CardValue>
                <CardArrowDashboard />
              </CardValueWrapper>
            </Card>
          </Link>
        </Col>
      </Row>
    </>
  );
};

const CohesionStayMedicalFileReceived = ({ data, getLink }) => {
  const total = Object.keys(data).reduce((acc, a) => acc + data[a], 0);
  return (
    <React.Fragment>
      <CardSubtitle>Fiches sanitaires</CardSubtitle>
      <Row>
        <Col md={6} xl={3} k="cohesionStayMedicalFileReceived_true">
          <Link to={getLink(`/volontaire`)}>
            <Card borderBottomColor="#6BC663">
              <CardTitle>Receptionnée</CardTitle>
              <CardValueWrapper>
                <CardValue>{data["true"] || 0}</CardValue>
                <CardPercentage>
                  {total ? `${(((data["true"] || 0) * 100) / total).toFixed(0)}%` : `0%`}
                  <CardArrowDashboard />
                </CardPercentage>
              </CardValueWrapper>
            </Card>
          </Link>
        </Col>
        <Col md={6} xl={3} k="cohesionStayMedicalFileReceived_false">
          <Link to={getLink(`/volontaire`)}>
            <Card borderBottomColor="#FEB951">
              <CardTitle>Non-receptionnée</CardTitle>
              <CardValueWrapper>
                <CardValue>{data["false"] || 0}</CardValue>
                <CardPercentage>
                  {total ? `${(((data["false"] || 0) * 100) / total).toFixed(0)}%` : `0%`}
                  <CardArrowDashboard />
                </CardPercentage>
              </CardValueWrapper>
            </Card>
          </Link>
        </Col>
      </Row>
    </React.Fragment>
  );
};

const CohesionStayPresence = ({ data, getLink }) => {
  const total = Object.keys(data).reduce((acc, a) => acc + data[a], 0);
  return (
    <React.Fragment>
      <CardSubtitle>Participations au séjour de cohésion</CardSubtitle>
      <Row>
        <Col md={6} xl={3} k="cohesionStayPresence_true">
          <Link to={getLink(`/volontaire`)}>
            <Card borderBottomColor="#6BC663">
              <CardTitle>Présent au séjour de cohésion</CardTitle>
              <CardValueWrapper>
                <CardValue>{data["true"] || 0}</CardValue>
                <CardPercentage>
                  {total ? `${(((data["true"] || 0) * 100) / total).toFixed(0)}%` : `0%`}
                  <CardArrowDashboard />
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
                  <CardArrowDashboard />
                </CardPercentage>
              </CardValueWrapper>
            </Card>
          </Link>
        </Col>
      </Row>
    </React.Fragment>
  );
};

const Card = styled.div`
  /* max-width: 325px; */
  min-height: 180px;
  padding: 22px 15px;
  border-bottom: 7px solid ${(props) => props.borderBottomColor};
  border-radius: 8px;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.05);
  background-color: #fff;
  margin-bottom: 33px;
`;
const CardTitle = styled.h3`
  color: #171725;
  font-size: 16px;
  font-weight: bold;
`;

const CardValueWrapper = styled.div`
  position: relative;
`;
const CardValue = styled.span`
  font-size: 28px;
`;

const CardSection = styled.div`
  font-family: Ubuntu;
  font-style: normal;
  font-weight: bold;
  font-size: 16px;
  line-height: 18px;
  text-transform: uppercase;
  color: #372f78;
`;
const CardSubtitle = styled.h3`
  color: #242526;
  font-size: 26px;
  margin-bottom: 10px;
  font-weight: normal;
`;

const CardPercentage = styled.span`
  font-size: 22px;
  color: #a8a8b1;
  display: flex;
  align-items: center;
  font-weight: 100;
`;
