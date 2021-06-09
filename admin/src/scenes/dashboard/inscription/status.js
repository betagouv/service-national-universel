import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { Col, Row, Input } from "reactstrap";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { YOUNG_STATUS_COLORS } from "../../../utils";
import CardArrowDashboard from "../../../components/CardArrowDashboard";

import api from "../../../services/api";

export default ({ filter }) => {
  const [status, setStatus] = useState({});

  const user = useSelector((state) => state.Auth.user);

  useEffect(() => {
    (async () => {
      const queries = [];
      queries.push({ index: "young", type: "_doc" });
      queries.push({
        query: { bool: { must: { match_all: {} }, filter: [{ term: { "cohort.keyword": filter.cohort } }] } },
        aggs: { status: { terms: { field: "status.keyword" } } },
        size: 0,
      });

      if (filter.region) queries[1].query.bool.filter.push({ term: { "region.keyword": filter.region } });
      if (filter.department) queries[1].query.bool.filter.push({ term: { "department.keyword": filter.department } });

      const { responses } = await api.esQuery(queries);
      const m = api.getAggregations(responses[0]);
      setStatus(m);
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
    <Row>
      {user.role === "admin" && (
        <Col md={6} xl={2}>
          <Link to={getLink('/inscription?STATUS=%5B"IN_PROGRESS"%5D')}>
            <Card borderBottomColor={YOUNG_STATUS_COLORS.IN_PROGRESS}>
              <CardTitle>En cours</CardTitle>
              <CardSubtitle>Inscriptions en cours</CardSubtitle>
              <CardValueWrapper>
                <CardValue>{status.IN_PROGRESS || 0}</CardValue>
                <CardArrowDashboard />
              </CardValueWrapper>
            </Card>
          </Link>
        </Col>
      )}
      <Col md={6} xl={2}>
        <Link to={getLink('/inscription?STATUS=%5B"WAITING_VALIDATION"%5D')}>
          <Card borderBottomColor={YOUNG_STATUS_COLORS.WAITING_VALIDATION}>
            <CardTitle>En attente de validation</CardTitle>
            <CardValueWrapper>
              <CardValue>{status.WAITING_VALIDATION || 0}</CardValue>
              <CardArrowDashboard />
            </CardValueWrapper>
          </Card>
        </Link>
      </Col>
      <Col md={6} xl={2}>
        <Link to={getLink('/inscription/?STATUS=%5B"WAITING_CORRECTION"%5D')}>
          <Card borderBottomColor={YOUNG_STATUS_COLORS.WAITING_CORRECTION}>
            <CardTitle>En attente de correction</CardTitle>
            <CardValueWrapper>
              <CardValue>{status.WAITING_CORRECTION || 0}</CardValue>
              <CardArrowDashboard />
            </CardValueWrapper>
          </Card>
        </Link>
      </Col>
      <Col md={6} xl={2}>
        <Link to={getLink('/inscription/?STATUS=%5B"VALIDATED"%5D')}>
          <Card borderBottomColor={YOUNG_STATUS_COLORS.VALIDATED}>
            <CardTitle>Validées</CardTitle>
            <CardValueWrapper>
              <CardValue>{status.VALIDATED || 0}</CardValue>
              <CardArrowDashboard />
            </CardValueWrapper>
          </Card>
        </Link>
      </Col>
      <Col md={6} xl={2}>
        <Link to={getLink('/inscription/?STATUS=%5B"REFUSED"%5D')}>
          <Card borderBottomColor={YOUNG_STATUS_COLORS.REFUSED}>
            <CardTitle>Refusées</CardTitle>
            <CardValueWrapper>
              <CardValue>{status.REFUSED || 0}</CardValue>
              <CardArrowDashboard />
            </CardValueWrapper>
          </Card>
        </Link>
      </Col>
      <Col md={6} xl={2}>
        <Link to={getLink('/inscription/?STATUS=%5B"WAITING_LIST"%5D')}>
          <Card borderBottomColor={YOUNG_STATUS_COLORS.WAITING_LIST}>
            <CardTitle>Liste complémentaire</CardTitle>
            <CardValueWrapper>
              <CardValue>{status.WAITING_LIST || 0}</CardValue>
              <CardArrowDashboard />
            </CardValueWrapper>
          </Card>
        </Link>
      </Col>
    </Row>
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
const CardSubtitle = styled.h3`
  font-size: 14px;
  font-weight: 100;
  color: #696974;
`;
const CardValueWrapper = styled.div`
  position: relative;
`;
const CardValue = styled.span`
  font-size: 28px;
`;
