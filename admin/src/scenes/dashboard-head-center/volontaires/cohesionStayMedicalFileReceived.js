import React from "react";
import { Col, Row } from "reactstrap";
import { Subtitle, CardComponentPercentage } from "../../../components/dashboard";
import { colors } from "../../../utils";

export default function CohesionStayMedicalFileReceived({ data, getLink }) {
  const total = Object.keys(data).reduce((acc, a) => acc + data[a], 0);
  return (
    <React.Fragment>
      <Subtitle>Fiches sanitaires</Subtitle>
      <Row>
        <Col md={6} xl={3}>
          <CardComponentPercentage
            getLink={getLink}
            to='/volontaire?MEDICAL_FILE_RECEIVED=%5B"true"%5D'
            color={colors.green}
            title="Receptionnée"
            value={data["true"]}
            total={total}
          />
        </Col>
        <Col md={6} xl={3}>
          <CardComponentPercentage
            getLink={getLink}
            to='/volontaire?MEDICAL_FILE_RECEIVED=%5B"false"%5D'
            color={colors.yellow}
            title="Non-receptionnée"
            value={data["false"]}
            total={total}
          />
        </Col>
        <Col md={6} xl={3}>
          <CardComponentPercentage disabled color={colors.grey} title="Non renseigné" value={data[""]} total={total} />
        </Col>
      </Row>
    </React.Fragment>
  );
}
