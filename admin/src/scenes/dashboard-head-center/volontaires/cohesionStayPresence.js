import React from "react";
import { Col, Row } from "reactstrap";
import { Subtitle, CardComponentPercentage } from "../../../components/dashboard";
import { colors } from "../../../utils";

export default ({ data, getLink }) => {
  const total = Object.keys(data).reduce((acc, a) => acc + data[a], 0);
  return (
    <React.Fragment>
      <Subtitle>Participations au séjour de cohésion</Subtitle>
      <Row>
        <Col md={6} xl={3} k="cohesionStayPresence_true">
          <CardComponentPercentage
            getLink={getLink}
            to='/volontaire?COHESION_PRESENCE=%5B"true"%5D'
            color={colors.green}
            title="Présent au séjour de cohésion"
            value={data["true"]}
            total={total}
          />
        </Col>
        <Col md={6} xl={3} k="cohesionStayPresence_false">
          <CardComponentPercentage
            getLink={getLink}
            to='/volontaire?COHESION_PRESENCE=%5B"false"%5D'
            color={colors.yellow}
            title="Absent au séjour de cohésion"
            value={data["false"]}
            total={total}
          />
        </Col>
        <Col md={6} xl={3} k="cohesionStayPresence_unknown">
          <CardComponentPercentage disabled color={colors.grey} title="Non renseigné" value={data[""]} total={total} />
        </Col>
      </Row>
    </React.Fragment>
  );
};
