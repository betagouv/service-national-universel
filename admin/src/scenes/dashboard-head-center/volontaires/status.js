import React, { useEffect, useState } from "react";
import { Col, Row } from "reactstrap";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { YOUNG_STATUS_COLORS } from "../../../utils";

import api from "../../../services/api";
import { CardArrow, Card, CardGrey, CardTitle, CardValueWrapper, CardValue, CardPercentage, CardSection, Subtitle } from "../../../components/dashboard";

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
      if (responses[0].aggregations.cohesionStayMedicalFileReceived.buckets.find((obj) => obj.key === "") !== undefined)
        responses[0].aggregations.cohesionStayMedicalFileReceived.buckets.find((obj) => obj.key === "").doc_count =
          responses[0].hits.total.value -
          responses[0].aggregations.cohesionStayMedicalFileReceived.buckets
            .filter((obj) => obj.key !== "")
            .reduce(function (acc, c) {
              return acc + c.doc_count;
            }, 0);
      setCohesionStayMedicalFileReceived(responses[0].aggregations.cohesionStayMedicalFileReceived.buckets.reduce((acc, c) => ({ ...acc, [c.key]: c.doc_count }), {}));
      if (responses[0].aggregations.cohesionStayPresence.buckets.find((obj) => obj.key === "") !== undefined)
        responses[0].aggregations.cohesionStayPresence.buckets.find((obj) => obj.key === "").doc_count =
          responses[0].hits.total.value -
          responses[0].aggregations.cohesionStayPresence.buckets
            .filter((obj) => obj.key !== "")
            .reduce(function (acc, c) {
              return acc + c.doc_count;
            }, 0);
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
  return (
    <>
      <Row>
        <Col md={12}>
          <CardSection>Phase 1</CardSection>
          <Subtitle>Statuts</Subtitle>
        </Col>
      </Row>
      <Row>
        <Col md={6} xl={2}>
          <Link to={getLink('/volontaire?STATUS_PHASE_1=%5B"AFFECTED"%5D')}>
            <Card borderBottomColor={YOUNG_STATUS_COLORS.AFFECTED} style={{ minHeight: "180px" }}>
              <CardTitle>Affectée</CardTitle>
              <CardValueWrapper>
                <CardValue>{data.AFFECTED || 0}</CardValue>
                <CardArrow />
              </CardValueWrapper>
            </Card>
          </Link>
        </Col>
        <Col md={6} xl={2}>
          <Link to={getLink('/volontaire?STATUS_PHASE_1=%5B"CANCEL"%5D')}>
            <Card borderBottomColor={YOUNG_STATUS_COLORS.CANCEL} style={{ minHeight: "180px" }}>
              <CardTitle>Annulée</CardTitle>
              <CardValueWrapper>
                <CardValue>{data.CANCEL || 0}</CardValue>
                <CardArrow />
              </CardValueWrapper>
            </Card>
          </Link>
        </Col>
        <Col md={6} xl={2}>
          <Link to={getLink('/volontaire?STATUS_PHASE_1=%5B"DONE"%5D')}>
            <Card borderBottomColor={YOUNG_STATUS_COLORS.DONE} style={{ minHeight: "180px" }}>
              <CardTitle>Réalisée</CardTitle>
              <CardValueWrapper>
                <CardValue>{data.DONE || 0}</CardValue>
                <CardArrow />
              </CardValueWrapper>
            </Card>
          </Link>
        </Col>
        <Col md={6} xl={2}>
          <Link to={getLink('/volontaire?STATUS_PHASE_1=%5B"NOT_DONE"%5D')}>
            <Card borderBottomColor={YOUNG_STATUS_COLORS.NOT_DONE} style={{ minHeight: "180px" }}>
              <CardTitle>Non réalisée</CardTitle>
              <CardValueWrapper>
                <CardValue>{data.NOT_DONE || 0}</CardValue>
                <CardArrow />
              </CardValueWrapper>
            </Card>
          </Link>
        </Col>
        <Col md={6} xl={2}>
          <Link to={getLink('/volontaire?STATUS_PHASE_1=%5B"WAITING_LIST"%5D')}>
            <Card borderBottomColor={YOUNG_STATUS_COLORS.WAITING_LIST} style={{ minHeight: "180px" }}>
              <CardTitle>Sur liste complémentaire</CardTitle>
              <CardValueWrapper>
                <CardValue>{data.WAITING_LIST || 0}</CardValue>
                <CardArrow />
              </CardValueWrapper>
            </Card>
          </Link>
        </Col>
        <Col md={6} xl={2}>
          <Link to={getLink('/volontaire?STATUS_PHASE_1=%5B"WITHDRAWN"%5D')}>
            <Card borderBottomColor={YOUNG_STATUS_COLORS.WITHDRAWN} style={{ minHeight: "180px" }}>
              <CardTitle>Désistée</CardTitle>
              <CardValueWrapper>
                <CardValue>{data.WITHDRAWN || 0}</CardValue>
                <CardArrow />
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
      <Subtitle>Fiches sanitaires</Subtitle>
      <Row>
        <Col md={6} xl={3} k="cohesionStayMedicalFileReceived_true">
          <Link to={getLink(`/volontaire?MEDICAL_FILE_RECEIVED=%5B"true"%5D`)}>
            <Card borderBottomColor="#6BC663">
              <CardTitle>Receptionnée</CardTitle>
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
        <Col md={6} xl={3} k="cohesionStayMedicalFileReceived_false">
          <Link to={getLink(`/volontaire?MEDICAL_FILE_RECEIVED=%5B"false"%5D`)}>
            <Card borderBottomColor="#EF4036">
              <CardTitle>Non-receptionnée</CardTitle>
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
        <Col md={6} xl={3} k="cohesionStayMedicalFileReceived_unknown">
          <CardGrey borderBottomColor="#FEB951">
            <CardTitle>Non renseigné</CardTitle>
            <CardValueWrapper>
              <CardValue>{data[""] || 0}</CardValue>
              <CardPercentage>
                {total ? `${(((data[""] || 0) * 100) / total).toFixed(0)}%` : `0%`}
                <CardArrow />
              </CardPercentage>
            </CardValueWrapper>
          </CardGrey>
        </Col>
      </Row>
    </React.Fragment>
  );
};

const CohesionStayPresence = ({ data, getLink }) => {
  const total = Object.keys(data).reduce((acc, a) => acc + data[a], 0);
  return (
    <React.Fragment>
      <Subtitle>Participations au séjour de cohésion</Subtitle>
      <Row>
        <Col md={6} xl={3} k="cohesionStayPresence_true">
          <Link to={getLink(`/volontaire?COHESION_PRESENCE=%5B"true"%5D`)}>
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
          <Link to={getLink(`/volontaire?COHESION_PRESENCE=%5B"false"%5D`)}>
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
        <Col md={6} xl={3} k="cohesionStayPresence_unknown">
          <CardGrey borderBottomColor="#FEB951">
            <CardTitle>Non renseigné</CardTitle>
            <CardValueWrapper>
              <CardValue>{data[""] || 0}</CardValue>
              <CardPercentage>
                {total ? `${(((data[""] || 0) * 100) / total).toFixed(0)}%` : `0%`}
                <CardArrow />
              </CardPercentage>
            </CardValueWrapper>
          </CardGrey>
        </Col>
      </Row>
    </React.Fragment>
  );
};
