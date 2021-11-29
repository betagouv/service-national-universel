import React, { useEffect, useState } from "react";
import { Col, Row } from "reactstrap";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { YOUNG_STATUS_COLORS, ROLES, getLink } from "../../../utils";
import { CardArrow, Card, CardTitle, CardSubtitle, CardValueWrapper, CardValue, CardPercentage } from "../../../components/dashboard";

import api from "../../../services/api";

export default function Status({ filter }) {
  const [status, setStatus] = useState({});

  const user = useSelector((state) => state.Auth.user);

  useEffect(() => {
    (async () => {
      const body = {
        query: { bool: { must: { match_all: {} }, filter: [] } },
        aggs: { status: { terms: { field: "status.keyword" } } },
        size: 0,
      };

      if (filter.cohort?.length) {
        // See: https://trello.com/c/wsy9Q1ro/1021-inscription-tableau-de-bord-en-cours
        if (filter.cohort.some((e) => e?.includes("2022"))) {
          body.query.bool.filter.push({ terms: { "cohort.keyword": [...filter.cohort, "2022"] } });
        } else {
          body.query.bool.filter.push({ terms: { "cohort.keyword": filter.cohort } });
        }
      }
      if (filter.status) body.query.bool.filter.push({ terms: { "status.keyword": filter.status } });
      if (filter.region?.length) body.query.bool.filter.push({ terms: { "region.keyword": filter.region } });
      if (filter.department?.length) body.query.bool.filter.push({ terms: { "department.keyword": filter.department } });
      if (filter.academy?.length) body.query.bool.filter.push({ terms: { "academy.keyword": filter.academy } });

      const { responses } = await api.esQuery("young", body);
      if (responses.length) {
        const m = api.getAggregations(responses[0]);
        setStatus(m);
      }
    })();
  }, [JSON.stringify(filter)]);

  return (
    <Row>
      {user.role === ROLES.ADMIN && (
        <Col md={6} xl={2}>
          <Link to={getLink({ base: "/inscription", filter, filtersUrl: ['STATUS=%5B"IN_PROGRESS"%5D'] })}>
            <Card borderBottomColor={YOUNG_STATUS_COLORS.IN_PROGRESS} style={{ minHeight: "180px" }}>
              <CardTitle>En cours</CardTitle>
              <CardSubtitle>Inscriptions en cours</CardSubtitle>
              <CardValueWrapper>
                <CardValue>{status.IN_PROGRESS || 0}</CardValue>
                <CardPercentage>
                  <CardArrow />
                </CardPercentage>
              </CardValueWrapper>
            </Card>
          </Link>
        </Col>
      )}
      <Col md={6} xl={2}>
        <Link to={getLink({ base: "/inscription", filter, filtersUrl: ['STATUS=%5B"WAITING_VALIDATION"%5D'] })}>
          <Card borderBottomColor={YOUNG_STATUS_COLORS.WAITING_VALIDATION} style={{ minHeight: "180px" }}>
            <CardTitle>En attente de validation</CardTitle>
            <CardValueWrapper>
              <CardValue>{status.WAITING_VALIDATION || 0}</CardValue>
              <CardPercentage>
                <CardArrow />
              </CardPercentage>
            </CardValueWrapper>
          </Card>
        </Link>
      </Col>
      <Col md={6} xl={2}>
        <Link to={getLink({ base: "/inscription", filter, filtersUrl: ['STATUS=%5B"WAITING_CORRECTION"%5D'] })}>
          <Card borderBottomColor={YOUNG_STATUS_COLORS.WAITING_CORRECTION} style={{ minHeight: "180px" }}>
            <CardTitle>En attente de correction</CardTitle>
            <CardValueWrapper>
              <CardValue>{status.WAITING_CORRECTION || 0}</CardValue>
              <CardPercentage>
                <CardArrow />
              </CardPercentage>
            </CardValueWrapper>
          </Card>
        </Link>
      </Col>
      <Col md={6} xl={2}>
        <Link to={getLink({ base: "/inscription", filter, filtersUrl: ['STATUS=%5B"VALIDATED"%5D'] })}>
          <Card borderBottomColor={YOUNG_STATUS_COLORS.VALIDATED} style={{ minHeight: "180px" }}>
            <CardTitle>Validées</CardTitle>
            <CardValueWrapper>
              <CardValue>{status.VALIDATED || 0}</CardValue>
              <CardPercentage>
                <CardArrow />
              </CardPercentage>
            </CardValueWrapper>
          </Card>
        </Link>
      </Col>
      <Col md={6} xl={2}>
        <Link to={getLink({ base: "/inscription", filter, filtersUrl: ['STATUS=%5B"REFUSED"%5D'] })}>
          <Card borderBottomColor={YOUNG_STATUS_COLORS.REFUSED} style={{ minHeight: "180px" }}>
            <CardTitle>Refusées</CardTitle>
            <CardValueWrapper>
              <CardValue>{status.REFUSED || 0}</CardValue>
              <CardPercentage>
                <CardArrow />
              </CardPercentage>
            </CardValueWrapper>
          </Card>
        </Link>
      </Col>
      <Col md={6} xl={2}>
        <Link to={getLink({ base: "/inscription", filter, filtersUrl: ['STATUS=%5B"WAITING_LIST"%5D'] })}>
          <Card borderBottomColor={YOUNG_STATUS_COLORS.WAITING_LIST} style={{ minHeight: "180px" }}>
            <CardTitle>Liste complémentaire</CardTitle>
            <CardValueWrapper>
              <CardValue>{status.WAITING_LIST || 0}</CardValue>
              <CardPercentage>
                <CardArrow />
              </CardPercentage>
            </CardValueWrapper>
          </Card>
        </Link>
      </Col>
    </Row>
  );
}
