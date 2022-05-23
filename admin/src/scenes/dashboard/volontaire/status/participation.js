import React from "react";
import { Col, Row } from "reactstrap";
import { Link } from "react-router-dom";

import { CardArrow, Card, CardTitle, CardValueWrapper, CardValue, CardPercentage, Subtitle } from "../../../../components/dashboard";

export default function Participation({ cohesionStayPresence, youngPhase1Agreement, filter, getLink, total, presenceJDM, departInform, departSejourMotif }) {
  return (
    <React.Fragment>
      <Subtitle>Participations au séjour de cohésion</Subtitle>
      <Row>
        <Col md={6} xl={3} k="cohesionStayPresence_true">
          <Link to={getLink({ base: `/volontaire`, filter, filtersUrl: ['STATUS=%5B"VALIDATED"%5D&COHESION_PRESENCE=%5B"true"%5D'] })}>
            <Card borderBottomColor="#6BC663">
              <CardTitle>Présent à l'arrivée</CardTitle>
              <CardValueWrapper>
                <CardValue>{cohesionStayPresence["true"] || 0}</CardValue>
                <CardPercentage>
                  {total ? `${(((cohesionStayPresence["true"] || 0) * 100) / total).toFixed(0)}%` : `0%`}
                  <CardArrow />
                </CardPercentage>
              </CardValueWrapper>
            </Card>
          </Link>
        </Col>
        <Col md={6} xl={3} k="cohesionStayPresence_false">
          <Link to={getLink({ base: `/volontaire`, filter, filtersUrl: ['STATUS=%5B"VALIDATED"%5D&COHESION_PRESENCE=%5B"false"%5D'] })}>
            <Card borderBottomColor="#EF4036">
              <CardTitle>Absent à l'arrivée</CardTitle>
              <CardValueWrapper>
                <CardValue>{cohesionStayPresence["false"] || 0}</CardValue>
                <CardPercentage>
                  {total ? `${(((cohesionStayPresence["false"] || 0) * 100) / total).toFixed(0)}%` : `0%`}
                  <CardArrow />
                </CardPercentage>
              </CardValueWrapper>
            </Card>
          </Link>
        </Col>
        <Col md={6} xl={3} k="cohesionStayPresence_NR">
          <Link to={getLink({ base: `/volontaire`, filter, filtersUrl: ['STATUS=%5B"VALIDATED"%5D&COHESION_PRESENCE=%5B"Non renseigné"%5D'] })}>
            <Card borderBottomColor="#d7d7d7">
              <CardTitle>Non renseigné</CardTitle>
              <CardValueWrapper>
                <CardValue>{total - cohesionStayPresence["false"] - cohesionStayPresence["true"] || 0}</CardValue>
                <CardPercentage>
                  {total ? `${(((total - cohesionStayPresence["false"] - cohesionStayPresence["true"] || 0) * 100) / total).toFixed(0)}%` : `0%`}
                  <CardArrow />
                </CardPercentage>
              </CardValueWrapper>
            </Card>
          </Link>
        </Col>
      </Row>
      <Row>
        <Col md={6} xl={3} k="presenceJDM_true">
          <Link to={getLink({ base: `/volontaire`, filter, filtersUrl: ['STATUS=%5B"VALIDATED"%5D&COHESION_JDM=%5B"true"%5D'] })}>
            <Card borderBottomColor="#6BC663">
              <CardTitle>Présent à la JDM</CardTitle>
              <CardValueWrapper>
                <CardValue>{presenceJDM["true"] || 0}</CardValue>
                <CardPercentage>
                  {total ? `${(((presenceJDM["true"] || 0) * 100) / total).toFixed(0)}%` : `0%`}
                  <CardArrow />
                </CardPercentage>
              </CardValueWrapper>
            </Card>
          </Link>
        </Col>
        <Col md={6} xl={3} k="presenceJDM_false">
          <Link to={getLink({ base: `/volontaire`, filter, filtersUrl: ['STATUS=%5B"VALIDATED"%5D&COHESION_JDM=%5B"false"%5D'] })}>
            <Card borderBottomColor="#EF4036">
              <CardTitle>Absent à la JDM</CardTitle>
              <CardValueWrapper>
                <CardValue>{presenceJDM["false"] || 0}</CardValue>
                <CardPercentage>
                  {total ? `${(((presenceJDM["false"] || 0) * 100) / total).toFixed(0)}%` : `0%`}
                  <CardArrow />
                </CardPercentage>
              </CardValueWrapper>
            </Card>
          </Link>
        </Col>
        <Col md={6} xl={3} k="presenceJDM_NR">
          <Link to={getLink({ base: `/volontaire`, filter, filtersUrl: ['STATUS=%5B"VALIDATED"%5D&COHESION_JDM=%5B"Non renseigné"%5D'] })}>
            <Card borderBottomColor="#d7d7d7">
              <CardTitle>Non renseigné</CardTitle>
              <CardValueWrapper>
                <CardValue>{total - presenceJDM["false"] - presenceJDM["true"] || 0}</CardValue>
                <CardPercentage>
                  {total ? `${(((total - presenceJDM["false"] - presenceJDM["true"] || 0) * 100) / total).toFixed(0)}%` : `0%`}
                  <CardArrow />
                </CardPercentage>
              </CardValueWrapper>
            </Card>
          </Link>
        </Col>
      </Row>
      <Row>
        <Col md={6} xl={3} k="departInform_true">
          <Link to={getLink({ base: `/volontaire`, filter, filtersUrl: ['STATUS=%5B"VALIDATED"%5D&DEPART=%5B"true"%5D'] })}>
            <Card borderBottomColor="#6BC663">
              <CardTitle>Départs renseignés</CardTitle>
              <CardValueWrapper>
                <CardValue>{departInform["true"] || 0}</CardValue>
                <CardPercentage>
                  {total ? `${(((departInform["true"] || 0) * 100) / total).toFixed(0)}%` : `0%`}
                  <CardArrow />
                </CardPercentage>
              </CardValueWrapper>
            </Card>
          </Link>
        </Col>
        <Col md={6} xl={3} k="departInform_exclusion">
          <Link to={getLink({ base: `/volontaire`, filter, filtersUrl: ['STATUS=%5B"VALIDATED"%5D&DEPART_MOTIF=%5B"Exclusion"%5D'] })}>
            <Card borderBottomColor="#EF4036">
              <CardTitle>Exclusion</CardTitle>
              <CardValueWrapper>
                <CardValue>{departSejourMotif["Exclusion"] || 0}</CardValue>
                <CardPercentage>
                  {total ? `${(((departSejourMotif["Exclusion"] || 0) * 100) / total).toFixed(0)}%` : `0%`}
                  <CardArrow />
                </CardPercentage>
              </CardValueWrapper>
            </Card>
          </Link>
        </Col>
        <Col md={6} xl={3} k="departInform_force">
          <Link to={getLink({ base: `/volontaire`, filter, filtersUrl: ['STATUS=%5B"VALIDATED"%5D&DEPART_MOTIF=%5B"Cas de force majeure pour le volontaire"%5D'] })}>
            <Card borderBottomColor="#FEB951">
              <CardTitle>Cas de force majeure</CardTitle>
              <CardValueWrapper>
                <CardValue>{departSejourMotif["Cas de force majeure pour le volontaire"] || 0}</CardValue>
                <CardPercentage>
                  {total ? `${(((departSejourMotif["Cas de force majeure pour le volontaire"] || 0) * 100) / total).toFixed(0)}%` : `0%`}
                  <CardArrow />
                </CardPercentage>
              </CardValueWrapper>
            </Card>
          </Link>
        </Col>
        <Col md={6} xl={3} k="departInform_cancel">
          <Link to={getLink({ base: `/volontaire`, filter, filtersUrl: ['STATUS=%5B"VALIDATED"%5D&DEPART_MOTIF=%5B"Annulation du séjour ou mesure d’éviction sanitaire"%5D'] })}>
            <Card borderBottomColor="#ffa987">
              <CardTitle>Annulation séjour/ éviction sanitaire</CardTitle>
              <CardValueWrapper>
                <CardValue>{departSejourMotif["Annulation du séjour ou mesure d’éviction sanitaire"] || 0}</CardValue>
                <CardPercentage>
                  {total ? `${(((departSejourMotif["Annulation du séjour ou mesure d’éviction sanitaire"] || 0) * 100) / total).toFixed(0)}%` : `0%`}
                  <CardArrow />
                </CardPercentage>
              </CardValueWrapper>
            </Card>
          </Link>
        </Col>
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
                  {total ? `${(((youngPhase1Agreement["true"] || 0) * 100) / total).toFixed(0)}%` : `0%`}
                  <CardArrow />
                </CardPercentage>
              </CardValueWrapper>
            </Card>
          </Link>
        </Col>
        <Col md={6} xl={4} k="cohesionStayPresence_false">
          <Link to={getLink({ base: `/volontaire`, filter, filtersUrl: ['STATUS=%5B"VALIDATED"%5D&COHESION_PARTICIPATION=%5B"false"%2C"Non+renseigné"%5D'] })}>
            <Card borderBottomColor="#EF4036">
              <CardTitle>Participation non renseignée</CardTitle>
              <CardValueWrapper>
                <CardValue>{total - youngPhase1Agreement["true"] || 0}</CardValue>
                <CardPercentage>
                  {total ? `${(((total - youngPhase1Agreement["true"] || 0) * 100) / total).toFixed(0)}%` : `0%`}
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
