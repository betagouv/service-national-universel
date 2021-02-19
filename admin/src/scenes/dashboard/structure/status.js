import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { Col, Row, Input } from "reactstrap";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { translate, YOUNG_STATUS_COLORS } from "../../../utils";

import api from "../../../services/api";
import { access } from "fs";

const legalStatusTypes = ["ASSOCIATION", "PUBLIC", "PRIVATE", "OTHER"];

export default ({ filter }) => {
  console.log(filter);
  const [status, setStatus] = useState({});
  const [withNetworkId, setWithNetworkId] = useState(0);
  const [total, setTotal] = useState(0);

  const user = useSelector((state) => state.Auth.user);

  useEffect(() => {
    async function initStatus() {
      const queries = [];
      queries.push({ index: "structure", type: "_doc" });
      queries.push({
        query: { bool: { must: { match_all: {} }, filter: [] } },
        aggs: {
          status: { terms: { field: "legalStatus.keyword" } },
          withNetworkId: { filter: { bool: { must: { exists: { field: "networkId.keyword" } }, must_not: { term: { "networkId.keyword": "" } } } } },
        },

        size: 0,
      });

      if (filter.region) queries[1].query.bool.filter.push({ term: { "region.keyword": filter.region } });
      if (filter.department) queries[1].query.bool.filter.push({ term: { "department.keyword": filter.department } });

      const { responses } = await api.esQuery(queries);
      setStatus(responses[0].aggregations.status.buckets.reduce((acc, c) => ({ ...acc, [c.key]: c.doc_count }), {}));
      setTotal(responses[0].hits.total.value);
      setWithNetworkId(responses[0].aggregations.withNetworkId.doc_count);
    }
    initStatus();
  }, [JSON.stringify(filter)]);

  return (
    <>
      <Row>
        <Col md={6} xl={6}>
          <Card borderBottomColor={YOUNG_STATUS_COLORS.IN_PROGRESS}>
            <CardTitle>Structures</CardTitle>
            <CardValueWrapper>
              <CardValue>{total || 0}</CardValue>
              <CardArrow />
            </CardValueWrapper>
          </Card>
        </Col>
        <Col md={6} xl={6}>
          <Card borderBottomColor={YOUNG_STATUS_COLORS.IN_PROGRESS}>
            <CardTitle>Affiliées à un réseau national</CardTitle>
            <CardValueWrapper>
              <CardValue>{withNetworkId || 0}</CardValue>
              <CardArrow />
            </CardValueWrapper>
          </Card>
        </Col>
      </Row>
      <Row>
        {legalStatusTypes.map((l, k) => {
          return (
            <Col md={6} xl={3} key={k}>
              <Card borderBottomColor={YOUNG_STATUS_COLORS.IN_PROGRESS}>
                <CardTitle>{translate(l)}</CardTitle>
                <CardValueWrapper>
                  <CardValue>{status[l] || 0}</CardValue>
                  <CardArrow />
                </CardValueWrapper>
              </Card>
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
