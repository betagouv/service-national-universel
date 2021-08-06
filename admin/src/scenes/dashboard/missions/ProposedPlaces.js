import React from "react";
import { Col, Row } from "reactstrap";
import { Link } from "react-router-dom";
import { Card, CardTitle, CardValueWrapper, CardValue, Subtitle } from "../../../components/dashboard";
import { colors } from "../../../utils";

export default ({ missionPlaceLeft, missionPlaceTotal, getLink }) => {
  return (
    <React.Fragment>
      <Subtitle>Places proposées par les structures</Subtitle>
      <Row>
        <Col md={6} xl={4} key="total">
          <Link to={getLink(`/mission`)}>
            <Card borderBottomColor="#372F78">
              <CardTitle>Places totales</CardTitle>
              <CardValueWrapper>
                <CardValue>{missionPlaceTotal}</CardValue>
              </CardValueWrapper>
            </Card>
          </Link>
        </Col>
        <Col md={6} xl={4} key="occupied">
          <Link to={getLink(`/mission`)}>
            <Card borderBottomColor={colors.yellow}>
              <CardTitle>Places occupées</CardTitle>
              <CardValueWrapper>
                <CardValue>{missionPlaceTotal - missionPlaceLeft}</CardValue>
              </CardValueWrapper>
            </Card>
          </Link>
        </Col>
        <Col md={6} xl={4} key="available">
          <Link to={getLink(`/mission`)}>
            <Card borderBottomColor={colors.green}>
              <CardTitle>Places disponibles</CardTitle>
              <CardValueWrapper>
                <CardValue>{missionPlaceLeft}</CardValue>
              </CardValueWrapper>
            </Card>
          </Link>
        </Col>
      </Row>
    </React.Fragment>
  );
};
