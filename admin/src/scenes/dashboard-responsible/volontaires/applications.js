import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { Col, Row, Input } from "reactstrap";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { APPLICATION_STATUS_COLORS } from "../../../utils";

import api from "../../../services/api";

export default ({ filter }) => {
  const [status, setStatus] = useState({});

  const user = useSelector((state) => state.Auth.user);

  useEffect(() => {
    (async () => {
      const queries = [];
      queries.push({ index: "application", type: "_doc" });
      queries.push({
        query: { bool: { must: { match_all: {} } } },
        aggs: { status: { terms: { field: "status.keyword" } } },
        size: 0,
      });

      if (filter.region) queries[1].query.bool.filter.push({ term: { "missionRegion.keyword": filter.region } });
      if (filter.department) queries[1].query.bool.filter.push({ term: { "missionDepartment.keyword": filter.department } });

      const { responses } = await api.esQuery(queries);
      const m = api.getAggregations(responses[0]);
      setStatus(m);
    })();
  }, [JSON.stringify(filter)]);

  return (
    <Row>
      <Col md={6} xl={2}>
        <div>
          <Card borderBottomColor={APPLICATION_STATUS_COLORS.IN_PROGRESS}>
            <CardTitle>En cours</CardTitle>
            <CardSubtitle>Mission en cours</CardSubtitle>
            <CardValueWrapper>
              <CardValue>{status.IN_PROGRESS || 0}</CardValue>
              <CardArrow />
            </CardValueWrapper>
          </Card>
        </div>
      </Col>
      <Col md={6} xl={2}>
        <Link to='/inscription?STATUS=%5B"WAITING_VALIDATION"%5D'>
          <Card borderBottomColor={APPLICATION_STATUS_COLORS.WAITING_VALIDATION}>
            <CardTitle>En attente de validation</CardTitle>
            <CardValueWrapper>
              <CardValue>{status.WAITING_VALIDATION || 0}</CardValue>
              <CardArrow />
            </CardValueWrapper>
          </Card>
        </Link>
      </Col>
      <Col md={6} xl={2}>
        <Link to='/inscription/?STATUS=%5B"VALIDATED"%5D'>
          <Card borderBottomColor={APPLICATION_STATUS_COLORS.VALIDATED}>
            <CardTitle>Validées</CardTitle>
            <CardValueWrapper>
              <CardValue>{status.VALIDATED || 0}</CardValue>
              <CardArrow />
            </CardValueWrapper>
          </Card>
        </Link>
      </Col>
      <Col md={6} xl={2}>
        <Link to='/inscription/?STATUS=%5B"VALIDATED"%5D'>
          <Card borderBottomColor={APPLICATION_STATUS_COLORS.DONE}>
            <CardTitle>Effectuées</CardTitle>
            <CardValueWrapper>
              <CardValue>{status.DONE || 0}</CardValue>
              <CardArrow />
            </CardValueWrapper>
          </Card>
        </Link>
      </Col>
      <Col md={6} xl={2}>
        <Link to='/inscription/?STATUS=%5B"REFUSED"%5D'>
          <Card borderBottomColor={APPLICATION_STATUS_COLORS.REFUSED}>
            <CardTitle>Refusées</CardTitle>
            <CardValueWrapper>
              <CardValue>{status.REFUSED || 0}</CardValue>
              <CardArrow />
            </CardValueWrapper>
          </Card>
        </Link>
      </Col>
      <Col md={6} xl={2}>
        <Link to='/inscription/?STATUS=%5B"REFUSED"%5D'>
          <Card borderBottomColor={APPLICATION_STATUS_COLORS.CANCEL}>
            <CardTitle>Annulés</CardTitle>
            <CardValueWrapper>
              <CardValue>{status.CANCEL || 0}</CardValue>
              <CardArrow />
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
const CardArrow = styled.span`
  position: absolute;
  top: 50%;
  right: 0;
  transform: translateY(-50%);
  width: 15px;
  height: 15px;
  background-image: url(${require("../../../assets/arrow.png")});
`;
