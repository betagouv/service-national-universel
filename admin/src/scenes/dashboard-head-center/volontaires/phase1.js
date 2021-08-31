import React from "react";
import { Col, Row } from "reactstrap";

import { YOUNG_STATUS_COLORS } from "../../../utils";
import { CardSection, Subtitle, CardComponent } from "../../../components/dashboard";

export default ({ data, getLink }) => {
  return (
    <>
      <Row>
        <Col md={12}>
          <CardSection>Phase 1</CardSection>
          <Subtitle>Statuts</Subtitle>
        </Col>
      </Row>
      <Row>
        <Col md={6} xl={2}>
          <CardComponent getLink={getLink} to='/volontaire?STATUS_PHASE_1=%5B"AFFECTED"%5D' color={YOUNG_STATUS_COLORS.AFFECTED} title="Affectée" value={data.AFFECTED} />
        </Col>
        <Col md={6} xl={2}>
          <CardComponent getLink={getLink} to='/volontaire?STATUS_PHASE_1=%5B"CANCEL"%5D' color={YOUNG_STATUS_COLORS.CANCEL} title="Annulée" value={data.CANCEL} />
        </Col>
        <Col md={6} xl={2}>
          <CardComponent getLink={getLink} to='/volontaire?STATUS_PHASE_1=%5B"DONE"%5D' color={YOUNG_STATUS_COLORS.DONE} title="Réalisée" value={data.DONE} />
        </Col>
        <Col md={6} xl={2}>
          <CardComponent getLink={getLink} to='/volontaire?STATUS_PHASE_1=%5B"NOT_DONE"%5D' color={YOUNG_STATUS_COLORS.NOT_DONE} title="Non réalisée" value={data.NOT_DONE} />
        </Col>
        <Col md={6} xl={2}>
          <CardComponent
            getLink={getLink}
            to='/volontaire?STATUS_PHASE_1=%5B"WAITING_LIST"%5D'
            color={YOUNG_STATUS_COLORS.WAITING_LIST}
            title="Sur liste complémentaire"
            value={data.WAITING_LIST}
          />
        </Col>
        <Col md={6} xl={2}>
          <CardComponent getLink={getLink} to='/volontaire?STATUS_PHASE_1=%5B"WITHDRAWN"%5D' color={YOUNG_STATUS_COLORS.WITHDRAWN} title="Désistée" value={data.WITHDRAWN} />
        </Col>
      </Row>
    </>
  );
};
