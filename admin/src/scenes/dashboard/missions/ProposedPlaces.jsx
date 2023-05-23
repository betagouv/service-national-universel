import React from "react";
import { Col, Row } from "reactstrap";
import { Link } from "react-router-dom";
import { Card, CardTitle, CardValueWrapper, CardValue } from "../../../components/dashboard";
import { colors } from "../../../utils";

export default function ProposedPlaces({ missionPlaceLeft, missionPlaceTotal, filter, getLink }) {
  return (
    <React.Fragment>
      <h3 className="mt-4 mb-2 text-xl">Places proposées par les structures</h3>
      <Row>
        <Col md={6} xl={4} key="total">
          <Link to={getLink({ base: "/mission", filter })}>
            <Card borderBottomColor="#372F78">
              <CardTitle>Places totales</CardTitle>
              <CardValueWrapper>
                <CardValue>{missionPlaceTotal}</CardValue>
              </CardValueWrapper>
            </Card>
          </Link>
        </Col>
        <Col md={6} xl={4} key="occupied">
          <Link to={getLink({ base: "/mission", filter })}>
            <Card borderBottomColor={colors.yellow}>
              <CardTitle>Places occupées</CardTitle>
              <CardValueWrapper>
                <CardValue>{missionPlaceTotal - missionPlaceLeft}</CardValue>
              </CardValueWrapper>
            </Card>
          </Link>
        </Col>
        <Col md={6} xl={4} key="available">
          <Link to={getLink({ base: "/mission", filter })}>
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
}
