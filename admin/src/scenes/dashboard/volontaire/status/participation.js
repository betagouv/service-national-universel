import React from "react";
import { Col, Row } from "reactstrap";
import { Link } from "react-router-dom";

import { CardArrow, Card, CardTitle, CardValueWrapper, CardValue, CardPercentage, Subtitle } from "../../../../components/dashboard";

export default function Participation({ cohesionStayPresence, youngPhase1Agreement, presenceJDM, departSejourMotif, filter, getLink }) {
  const totalPresence = Object.keys(cohesionStayPresence).reduce((acc, a) => acc + cohesionStayPresence[a], 0);
  const totalPresenceJDM = Object.keys(presenceJDM).reduce((acc, a) => acc + presenceJDM[a], 0);
  const totalAgreement = Object.keys(youngPhase1Agreement).reduce((acc, a) => acc + youngPhase1Agreement[a], 0);
  const totalDepartSejourMotif = Object.keys(departSejourMotif).reduce((acc, a) => acc + departSejourMotif[a], 0);

  return (
    <React.Fragment>
      <Subtitle>Participations au séjour de cohésion</Subtitle>
      <Row>
        <Col md={6} xl={3} k="cohesionStayPresence_true">
          <Link to={getLink({ base: `/volontaire`, filter, filtersUrl: ['STATUS=%5B"VALIDATED"%5D&COHESION_PRESENCE=%5B"true"%5D'] })}>
            <Card borderBottomColor="#6BC663">
              <CardTitle>Présent à l&apos;arrivée</CardTitle>
              <CardValueWrapper>
                <CardValue>{cohesionStayPresence["true"] || 0}</CardValue>
                <CardPercentage>
                  {totalPresence ? `${(((cohesionStayPresence["true"] || 0) * 100) / totalPresence).toFixed(0)}%` : `0%`}
                  <CardArrow />
                </CardPercentage>
              </CardValueWrapper>
            </Card>
          </Link>
        </Col>
        <Col md={6} xl={3} k="cohesionStayPresence_false">
          <Link to={getLink({ base: `/volontaire`, filter, filtersUrl: ['STATUS=%5B"VALIDATED"%5D&COHESION_PRESENCE=%5B"false"%5D'] })}>
            <Card borderBottomColor="#EF4036">
              <CardTitle>Absent à l&apos;arrivée</CardTitle>
              <CardValueWrapper>
                <CardValue>{cohesionStayPresence["false"] || 0}</CardValue>
                <CardPercentage>
                  {totalPresence ? `${(((cohesionStayPresence["false"] || 0) * 100) / totalPresence).toFixed(0)}%` : `0%`}
                  <CardArrow />
                </CardPercentage>
              </CardValueWrapper>
            </Card>
          </Link>
        </Col>
      </Row>
      <Row>
        <Col md={6} xl={3} k="presenceJDM_true">
          <Link to={getLink({ base: `/volontaire`, filter, filtersUrl: ['STATUS=%5B"VALIDATED"%5D&PRESENCE_JDM=%5B"true"%5D'] })}>
            <Card borderBottomColor="#6BC663">
              <CardTitle>Présent à la JDM</CardTitle>
              <CardValueWrapper>
                <CardValue>{presenceJDM["true"] || 0}</CardValue>
                <CardPercentage>
                  {totalPresenceJDM ? `${(((presenceJDM["true"] || 0) * 100) / totalPresenceJDM).toFixed(0)}%` : `0%`}
                  <CardArrow />
                </CardPercentage>
              </CardValueWrapper>
            </Card>
          </Link>
        </Col>
        <Col md={6} xl={3} k="presenceJDM_false">
          <Link to={getLink({ base: `/volontaire`, filter, filtersUrl: ['STATUS=%5B"VALIDATED"%5D&PRESENCE_JDM=%5B"false"%5D'] })}>
            <Card borderBottomColor="#EF4036">
              <CardTitle>Absent à la JDM</CardTitle>
              <CardValueWrapper>
                <CardValue>{presenceJDM["false"] || 0}</CardValue>
                <CardPercentage>
                  {totalPresenceJDM ? `${(((presenceJDM["false"] || 0) * 100) / totalPresenceJDM).toFixed(0)}%` : `0%`}
                  <CardArrow />
                </CardPercentage>
              </CardValueWrapper>
            </Card>
          </Link>
        </Col>
      </Row>
      <Row>
        {Object.keys(departSejourMotif).map((motif) => (
          <Col key={motif} md={6} xl={3} k="presenceJDM_false">
            <Link to={getLink({ base: `/volontaire`, filter, filtersUrl: ['STATUS=%5B"VALIDATED"%5D'] })}>
              <Card borderBottomColor="#F6F6F6">
                <CardTitle>{motif}</CardTitle>
                <CardValueWrapper>
                  <CardValue>{departSejourMotif[motif] || 0}</CardValue>
                  <CardPercentage>
                    {totalDepartSejourMotif ? `${(((departSejourMotif[motif] || 0) * 100) / totalDepartSejourMotif).toFixed(0)}%` : `0%`}
                    <CardArrow />
                  </CardPercentage>
                </CardValueWrapper>
              </Card>
            </Link>
          </Col>
        ))}
      </Row>
      <Subtitle>Confirmation de participation au séjour de cohésion</Subtitle>
      <Row>
        <Col md={6} xl={4} k="cohesionStayPresence_true">
          <Link to={getLink({ base: `/volontaire`, filter, filtersUrl: ['STATUS=%5B"VALIDATED"%5D&COHESION_PARTICIPATION=%5B"true"%5D'] })}>
            <Card borderBottomColor="#6BC663">
              <CardTitle>Participation confirmée</CardTitle>
              <CardValueWrapper>
                <CardValue>{youngPhase1Agreement["true"] || 0}</CardValue>
                <CardPercentage>
                  {totalAgreement ? `${(((youngPhase1Agreement["true"] || 0) * 100) / totalAgreement).toFixed(0)}%` : `0%`}
                  <CardArrow />
                </CardPercentage>
              </CardValueWrapper>
            </Card>
          </Link>
        </Col>
        <Col md={6} xl={4} k="cohesionStayPresence_false">
          <Link to={getLink({ base: `/volontaire`, filter, filtersUrl: ['STATUS=%5B"VALIDATED"%5D&COHESION_PARTICIPATION=%5B"false"%5D'] })}>
            <Card borderBottomColor="#EF4036">
              <CardTitle>Participation non renseignée</CardTitle>
              <CardValueWrapper>
                <CardValue>{youngPhase1Agreement["false"] || 0}</CardValue>
                <CardPercentage>
                  {totalAgreement ? `${(((youngPhase1Agreement["false"] || 0) * 100) / totalAgreement).toFixed(0)}%` : `0%`}
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
