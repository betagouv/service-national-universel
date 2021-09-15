import React from "react";
import { Col, Row } from "reactstrap";

import { Link } from "react-router-dom";
import { YOUNG_STATUS_COLORS } from "../../../../utils";
import { CardArrow, Card, CardTitle, CardValueWrapper, CardValue, CardPercentage } from "../../../../components/dashboard";

export default ({ status, statusPhase1, statusPhase2, statusPhase3, filter, getLink }) => {
  const total = Object.keys(status).reduce((acc, a) => acc + status[a], 0);

  return (
    <React.Fragment>
      <Row>
        <Col md={6} xl={4}>
          <Link to={getLink({ base: `/volontaire`, filter, filtersUrl: ['STATUS=%5B"VALIDATED"%5D'] })}>
            <Card borderBottomColor={YOUNG_STATUS_COLORS.IN_PROGRESS}>
              <CardTitle>Volontaires</CardTitle>
              <CardValueWrapper>
                <CardValue>{status.VALIDATED || 0}</CardValue>
                <CardPercentage>
                  {total ? `${(((status.VALIDATED || 0) * 100) / total).toFixed(0)}%` : `0%`}
                  <CardArrow />
                </CardPercentage>
              </CardValueWrapper>
            </Card>
          </Link>
        </Col>
      </Row>
      <Row>
        <Col md={6} xl={4}>
          <Link to={getLink({ base: `/volontaire`, filter, filtersUrl: ['STATUS_PHASE_1=%5B"DONE"%5D'] })}>
            <Card borderBottomColor={YOUNG_STATUS_COLORS.VALIDATED}>
              <CardTitle>Ayant validé la Phase 1</CardTitle>
              <CardValueWrapper>
                <CardValue>{statusPhase1.DONE || 0}</CardValue>
                <CardPercentage>
                  {total ? `${(((statusPhase1.DONE || 0) * 100) / total).toFixed(0)}%` : `0%`}
                  <CardArrow />
                </CardPercentage>
              </CardValueWrapper>
            </Card>
          </Link>
        </Col>
        <Col md={6} xl={4}>
          <Link to={getLink({ base: `/volontaire`, filter, filtersUrl: ['STATUS_PHASE_2=%5B"VALIDATED"%5D'] })}>
            <Card borderBottomColor={YOUNG_STATUS_COLORS.VALIDATED}>
              <CardTitle>Ayant validé la Phase 2</CardTitle>
              <CardValueWrapper>
                <CardValue>{statusPhase2.VALIDATED || 0}</CardValue>
                <CardPercentage>
                  {total ? `${(((statusPhase2.VALIDATED || 0) * 100) / total).toFixed(0)}%` : `0%`}
                  <CardArrow />
                </CardPercentage>
              </CardValueWrapper>
            </Card>
          </Link>
        </Col>
        <Col md={6} xl={4}>
          <Card borderBottomColor={YOUNG_STATUS_COLORS.VALIDATED}>
            <CardTitle>Ayant validé la Phase 3</CardTitle>
            <CardValueWrapper>
              <CardValue>{statusPhase3.VALIDATED || 0}</CardValue>
              <CardPercentage>
                {total ? `${(((statusPhase3.VALIDATED || 0) * 100) / total).toFixed(0)}%` : `0%`}
                <CardArrow />
              </CardPercentage>
            </CardValueWrapper>
          </Card>
        </Col>
      </Row>
      <Row>
        <Col md={6} xl={4}>
          <Link to={getLink({ base: `/volontaire`, filter, filtersUrl: ['STATUS=%5B"WITHDRAWN"%5D'] })}>
            <Card borderBottomColor={YOUNG_STATUS_COLORS.WITHDRAWN}>
              <CardTitle>Désistés</CardTitle>
              <CardValueWrapper>
                <CardValue>{status.WITHDRAWN || 0}</CardValue>
                <CardPercentage>
                  {total ? `${(((status.WITHDRAWN || 0) * 100) / total).toFixed(0)}%` : `0%`}
                  <CardArrow />
                </CardPercentage>
              </CardValueWrapper>
            </Card>
          </Link>
        </Col>
      </Row>
    </React.Fragment>
  );
};
