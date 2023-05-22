import React from "react";
import { Col, Row } from "reactstrap";

import { YOUNG_STATUS_COLORS } from "../../../../utils";
import { Card, CardTitle, CardValueWrapper, CardValue } from "../../../../components/dashboard";

export default function Status({ youngWhoChangedCohortIn, youngWhoChangedCohortOut, filter }) {
  return filter.cohort.length > 0 ? (
    <Row>
      <Col md={6} xl={4}>
        <Card borderBottomColor={YOUNG_STATUS_COLORS.WAITING_CORRECTION}>
          <CardTitle>{`Volontaires ayant quitté ${filter.cohort?.length > 1 ? "les cohortes" : "la cohorte"}`}</CardTitle>
          <CardValueWrapper>
            <CardValue>{Object.keys(youngWhoChangedCohortOut).reduce((acc, a) => acc + youngWhoChangedCohortOut[a], 0)}</CardValue>
          </CardValueWrapper>
        </Card>
      </Col>
      <Col md={6} xl={4}>
        <Card borderBottomColor={YOUNG_STATUS_COLORS.VALIDATED}>
          <CardTitle>{`Volontaires ayant rejoint ${filter.cohort?.length > 1 ? "les cohortes" : "la cohorte"}`}</CardTitle>
          <CardValueWrapper>
            <CardValue>{Object.keys(youngWhoChangedCohortIn).reduce((acc, a) => acc + youngWhoChangedCohortIn[a], 0)}</CardValue>
          </CardValueWrapper>
        </Card>
      </Col>
    </Row>
  ) : null;
}
