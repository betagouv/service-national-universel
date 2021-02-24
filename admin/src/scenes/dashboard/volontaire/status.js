import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { Col, Row, Input } from "reactstrap";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { translate, YOUNG_STATUS_COLORS, YOUNG_STATUS_PHASE2, YOUNG_STATUS_PHASE2_COLORS } from "../../../utils";

import api from "../../../services/api";

export default ({ filter }) => {
  const [status, setStatus] = useState({});
  const [statusPhase1, setStatusPhase1] = useState({});
  const [statusPhase2, setStatusPhase2] = useState({});
  const [statusPhase3, setStatusPhase3] = useState({});

  const user = useSelector((state) => state.Auth.user);

  useEffect(() => {
    (async () => {
      const queries = [];
      queries.push({ index: "young", type: "_doc" });
      queries.push({
        query: { bool: { must: { match_all: {} }, filter: [{ term: { "cohort.keyword": filter.cohort } }, { terms: { "status.keyword": ["VALIDATED", "WITHDRAWN"] } }] } },
        aggs: {
          status: { terms: { field: "status.keyword" } },
          statusPhase1: { terms: { field: "statusPhase1.keyword" } },
          statusPhase2: { terms: { field: "statusPhase2.keyword" } },
          statusPhase3: { terms: { field: "statusPhase3.keyword" } },
        },
        size: 0,
      });

      if (filter.region) queries[1].query.bool.filter.push({ term: { "region.keyword": filter.region } });
      if (filter.department) queries[1].query.bool.filter.push({ term: { "department.keyword": filter.department } });

      const { responses } = await api.esQuery(queries);
      setStatus(responses[0].aggregations.status.buckets.reduce((acc, c) => ({ ...acc, [c.key]: c.doc_count }), {}));
      setStatusPhase1(responses[0].aggregations.statusPhase1.buckets.reduce((acc, c) => ({ ...acc, [c.key]: c.doc_count }), {}));
      setStatusPhase2(responses[0].aggregations.statusPhase2.buckets.reduce((acc, c) => ({ ...acc, [c.key]: c.doc_count }), {}));
      setStatusPhase3(responses[0].aggregations.statusPhase3.buckets.reduce((acc, c) => ({ ...acc, [c.key]: c.doc_count }), {}));
    })();
  }, [JSON.stringify(filter)]);

  return (
    <>
      <Row>
        <Col md={6} xl={3}>
          <Link to={`/volontaire?COHORT=%5B"${filter.cohort}"%5D&STATUS=%5B"VALIDATED"%5D`}>
            <Card borderBottomColor={YOUNG_STATUS_COLORS.IN_PROGRESS}>
              <CardTitle>Volontaires</CardTitle>
              <CardValueWrapper>
                <CardValue>{status.VALIDATED || 0}</CardValue>
                <CardArrow />
              </CardValueWrapper>
            </Card>
          </Link>
        </Col>
        <Col md={6} xl={3}>
          <Link to={`/volontaire?COHORT=%5B"${filter.cohort}"%5D&STATUS_PHASE_1=%5B"DONE"%5D`}>
            <Card borderBottomColor={YOUNG_STATUS_COLORS.IN_PROGRESS}>
              <CardTitle>Ayant validé la phase 1</CardTitle>
              <CardValueWrapper>
                <CardValue>{statusPhase1.DONE || 0}</CardValue>
                <CardArrow />
              </CardValueWrapper>
            </Card>
          </Link>
        </Col>
        <Col md={6} xl={3}>
          <Link to={`/volontaire?COHORT=%5B"${filter.cohort}"%5D&STATUS_PHASE_2=%5B"VALIDATED"%5D`}>
            <Card borderBottomColor={YOUNG_STATUS_COLORS.IN_PROGRESS}>
              <CardTitle>Ayant validé la phase 2</CardTitle>
              <CardValueWrapper>
                <CardValue>{statusPhase2.VALIDATED || 0}</CardValue>
                <CardArrow />
              </CardValueWrapper>
            </Card>
          </Link>
        </Col>
        <Col md={6} xl={3}>
          <Card borderBottomColor={YOUNG_STATUS_COLORS.IN_PROGRESS}>
            <CardTitle>Ayant validé la phase 3</CardTitle>
            <CardValueWrapper>
              <CardValue>{statusPhase3.VALIDATED || 0}</CardValue>
              <CardArrow />
            </CardValueWrapper>
          </Card>
        </Col>
        <Col md={6} xl={3}>
          <Link to={`/volontaire?COHORT=%5B"${filter.cohort}"%5D&STATUS=%5B"WITHDRAWN"%5D`}>
            <Card borderBottomColor={YOUNG_STATUS_COLORS.IN_PROGRESS}>
              <CardTitle>Désistés</CardTitle>
              <CardValueWrapper>
                <CardValue>{status.WITHDRAWN || 0}</CardValue>
                <CardArrow />
              </CardValueWrapper>
            </Card>
          </Link>
        </Col>
      </Row>
      <Row>
        <Col md={12}>
          <h3>Phase 2</h3>
        </Col>
      </Row>
      <Row>
        {Object.values(YOUNG_STATUS_PHASE2).map((e) => {
          return (
            <Col md={6} xl={3} k={e}>
              <Link to={`/volontaire?COHORT=%5B"${filter.cohort}"%5D&STATUS_PHASE_2=%5B"${e}"%5D`}>
                <Card borderBottomColor={YOUNG_STATUS_PHASE2_COLORS[e]}>
                  <CardTitle>{e === "VALIDATED" ? "Réalisée" : translate(e)}</CardTitle>
                  <CardValueWrapper>
                    <CardValue>{statusPhase2[e] || 0}</CardValue>
                    <CardArrow />
                  </CardValueWrapper>
                </Card>
              </Link>
            </Col>
          );
        })}
      </Row>
    </>
  );
};

const Card = styled.div`
  /* max-width: 325px; */
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
const CardArrow = styled.span`
  position: absolute;
  top: 50%;
  right: 0;
  transform: translateY(-50%);
  width: 15px;
  height: 15px;
  background-image: url(${require("../../../assets/arrow.png")});
`;
