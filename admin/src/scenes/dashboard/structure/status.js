import React, { useEffect, useState } from "react";
import { Col, Row } from "reactstrap";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { translate, YOUNG_STATUS_COLORS, getLink } from "../../../utils";

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

      if (filter.region?.length) body.query.bool.filter.push({ terms: { "region.keyword": filter.region } });
      if (filter.department?.length) body.query.bool.filter.push({ terms: { "department.keyword": filter.department } });

      const { responses } = await api.esQuery("structure", body);
      if (responses.length) {
        setStatus(responses[0].aggregations.status.buckets.reduce((acc, c) => ({ ...acc, [c.key]: c.doc_count }), {}));
        setTotal(responses[0].hits.total.value);
        setWithNetworkId(responses[0].aggregations.withNetworkId.doc_count);
      }
    }
    initStatus();
  }, [JSON.stringify(filter)]);

  return (
    <>
      <Row>
        <Col md={6} xl={6}>
          <Link to={getLink({ base: `/structure`, filter })}>
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
          <Link to={getLink({ base: `/structure`, filter })}>
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
              <Link to={getLink({ base: `/structure`, filter, filtersUrl: [`LEGAL_STATUS=%5B"${l}"%5D&`] })}>
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
