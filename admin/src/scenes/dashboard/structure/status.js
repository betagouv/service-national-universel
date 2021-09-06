import React, { useEffect, useState } from "react";
import { Col, Row } from "reactstrap";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { translate, YOUNG_STATUS_COLORS } from "../../../utils";

import api from "../../../services/api";
import { CardArrow, Card, CardTitle, CardValueWrapper, CardValue, CardPercentage } from "../../../components/dashboard";

const legalStatusTypes = ["ASSOCIATION", "PUBLIC", "PRIVATE", "OTHER"];

export default ({ filter }) => {
  const [status, setStatus] = useState({});
  const [withNetworkId, setWithNetworkId] = useState(0);
  const [total, setTotal] = useState(0);

  const user = useSelector((state) => state.Auth.user);

  useEffect(() => {
    async function initStatus() {
      const body = {
        query: { bool: { must: { match_all: {} }, filter: [] } },
        aggs: {
          status: { terms: { field: "legalStatus.keyword" } },
          withNetworkId: { filter: { bool: { must: { exists: { field: "networkId.keyword" } }, must_not: { term: { "networkId.keyword": "" } } } } },
        },

        size: 0,
      };

      if (filter.region) body.query.bool.filter.push({ term: { "region.keyword": filter.region } });
      if (filter.department) body.query.bool.filter.push({ term: { "department.keyword": filter.department } });

      const { responses } = await api.esQuery("structure", body);
      if (responses.length) {
        setStatus(responses[0].aggregations.status.buckets.reduce((acc, c) => ({ ...acc, [c.key]: c.doc_count }), {}));
        setTotal(responses[0].hits.total.value);
        setWithNetworkId(responses[0].aggregations.withNetworkId.doc_count);
      }
    }
    initStatus();
  }, [JSON.stringify(filter)]);

  const replaceSpaces = (v) => v.replace(/\s+/g, "+");

  const getLink = (link) => {
    if (filter.region) link += `REGION=%5B"${replaceSpaces(filter.region)}"%5D`;
    if (filter.department) link += `&DEPARTMENT=%5B"${replaceSpaces(filter.department)}"%5D`;
    return link;
  };

  return (
    <>
      <Row>
        <Col md={6} xl={6}>
          <Link to={getLink(`/structure?`)}>
            <Card borderBottomColor={YOUNG_STATUS_COLORS.IN_PROGRESS}>
              <CardTitle>Structures</CardTitle>
              <CardValueWrapper>
                <CardValue>{total || 0}</CardValue>
                <CardArrow />
              </CardValueWrapper>
            </Card>
          </Link>
        </Col>
        <Col md={6} xl={6}>
          <Link to={getLink(`/structure?`)}>
            <Card borderBottomColor={YOUNG_STATUS_COLORS.IN_PROGRESS}>
              <CardTitle>Affiliées à un réseau national</CardTitle>
              <CardValueWrapper>
                <CardValue>{withNetworkId || 0}</CardValue>
                <CardArrow />
              </CardValueWrapper>
            </Card>
          </Link>
        </Col>
      </Row>
      <Row>
        {legalStatusTypes.map((l, k) => {
          return (
            <Col md={6} xl={3} key={k}>
              <Link to={getLink(`/structure?LEGAL_STATUS=%5B"${l}"%5D&`)}>
                <Card borderBottomColor={YOUNG_STATUS_COLORS.IN_PROGRESS}>
                  <CardTitle>{`${translate(l)}s`}</CardTitle>
                  <CardValueWrapper>
                    <CardValue>{status[l] || 0}</CardValue>
                    <CardPercentage>
                      {total ? `${(((status[l] || 0) * 100) / total).toFixed(0)}%` : `0%`}
                      <CardArrow />
                    </CardPercentage>
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
