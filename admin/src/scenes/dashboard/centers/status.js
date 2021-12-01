import React, { useEffect, useState } from "react";
import { Col, Row } from "reactstrap";
import { Link } from "react-router-dom";
import { YOUNG_STATUS_COLORS, colors, getLink } from "../../../utils";
import { CardArrow, Card, CardTitle, CardValueWrapper, CardValue } from "../../../components/dashboard";

import api from "../../../services/api";

export default ({ filter }) => {
  const [placesTotal, setPlacesTotal] = useState(0);
  const [placesLeft, setPlacesLeft] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    async function initStatus() {
      const body = {
        query: { bool: { must: { match_all: {} }, filter: [] } },
        aggs: {
          placesTotal: { sum: { field: "placesTotal" } },
          placesLeft: { sum: { field: "placesLeft" } },
        },
        size: 0,
      };

      if (filter.region?.length) body.query.bool.filter.push({ terms: { "region.keyword": filter.region } });
      if (filter.department?.length) body.query.bool.filter.push({ terms: { "department.keyword": filter.department } });

      const { responses } = await api.esQuery("cohesioncenter", body);
      if (responses.length) {
        setPlacesTotal(responses[0].aggregations.placesTotal.value);
        setPlacesLeft(responses[0].aggregations.placesLeft.value);
        setTotal(responses[0].hits.total.value);
      }
    }
    initStatus();
  }, [JSON.stringify(filter)]);

  return (
    <>
      <Row>
        <Col md={6} xl={6}>
          <Link to={getLink({ base: `/centre`, filter })}>
            <Card borderBottomColor={YOUNG_STATUS_COLORS.IN_PROGRESS}>
              <CardTitle>Centres</CardTitle>
              <CardValueWrapper>
                <CardValue>{total}</CardValue>
                <CardArrow />
              </CardValueWrapper>
            </Card>
          </Link>
        </Col>
      </Row>
      <Row>
        <Col md={6} xl={3}>
          <Card borderBottomColor={colors.yellow}>
            <CardTitle>Places proposées</CardTitle>
            <CardValueWrapper>
              <CardValue>{placesTotal}</CardValue>
            </CardValueWrapper>
          </Card>
        </Col>
        <Col md={6} xl={3}>
          <Card borderBottomColor={colors.green}>
            <CardTitle>Places disponibles</CardTitle>
            <CardValueWrapper>
              <CardValue>{placesLeft}</CardValue>
            </CardValueWrapper>
          </Card>
        </Col>
        <Col md={6} xl={3}>
          <Card borderBottomColor={YOUNG_STATUS_COLORS.IN_PROGRESS}>
            <CardTitle>Taux d'occupation</CardTitle>
            <CardValueWrapper>
              <CardValue>{placesTotal ? `${(((placesTotal - placesLeft || 0) * 100) / placesTotal).toFixed(2)}%` : `0%`}</CardValue>
            </CardValueWrapper>
          </Card>
        </Col>
      </Row>
    </>
  );
};
