import React, { useEffect, useState } from "react";
import { Col, Row } from "reactstrap";
import { Link } from "react-router-dom";
import { YOUNG_STATUS_COLORS } from "../../../utils";
import { CardArrow, Card, CardTitle, CardValueWrapper, CardValue } from "../../../components/dashboard";

import api from "../../../services/api";

export default ({ filter }) => {
  const [placesTotal, setPlacesTotal] = useState(0);
  const [placesLeft, setPlacesLeft] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    async function initStatus() {
      const queries = [];
      queries.push({ index: "cohesioncenter", type: "_doc" });
      queries.push({
        query: { bool: { must: { match_all: {} }, filter: [] } },
        aggs: {
          placesTotal: { sum: { field: "placesTotal" } },
          placesLeft: { sum: { field: "placesLeft" } },
        },

        size: 0,
      });

      if (filter.region) queries[1].query.bool.filter.push({ term: { "region.keyword": filter.region } });
      if (filter.department) queries[1].query.bool.filter.push({ term: { "department.keyword": filter.department } });

      const { responses } = await api.esQuery(queries);
      setPlacesTotal(responses[0].aggregations.placesTotal.value);
      setPlacesLeft(responses[0].aggregations.placesLeft.value);
      setTotal(responses[0].hits.total.value);
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
          <Link to={getLink(`/centre?`)}>
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
          <Card borderBottomColor="#FEB951">
            <CardTitle>Places proposées</CardTitle>
            <CardValueWrapper>
              <CardValue>{placesTotal}</CardValue>
            </CardValueWrapper>
          </Card>
        </Col>
        <Col md={6} xl={3}>
          <Card borderBottomColor="#6BC763">
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
