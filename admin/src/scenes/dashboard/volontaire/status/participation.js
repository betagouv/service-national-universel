import React from "react";
import { Col, Row } from "reactstrap";
import { Link } from "react-router-dom";

import { CardArrow, Card, CardTitle, CardValueWrapper, CardValue, CardPercentage, Subtitle } from "../../../../components/dashboard";

export default function Participation({ data, filter, getLink }) {
  const total = Object.keys(data).reduce((acc, a) => acc + data[a], 0);
  return (
    <React.Fragment>
      <Subtitle>Participations au séjour de cohésion</Subtitle>
      <Row>
        <Col md={6} xl={3} k="cohesionStayPresence_true">
          <Link to={getLink({ base: `/volontaire`, filter, filtersUrl: ['STATUS=%5B"VALIDATED"%5D&COHESION_PRESENCE=%5B"true"%5D'] })}>
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
          <Link to={getLink({ base: `/volontaire`, filter, filtersUrl: ['STATUS=%5B"VALIDATED"%5D&COHESION_PRESENCE=%5B"false"%5D'] })}>
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
      </Row>
    </React.Fragment>
  );
}
