import React from "react";
import { Col, Row } from "reactstrap";
import { Link } from "react-router-dom";
import { Card, CardTitle, CardValueWrapper, CardValue, Subtitle } from "../../../components/dashboard";

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
                {/* <CardPercentage>
                  100%
                  <CardArrow />
                </CardPercentage> */}
              </CardValueWrapper>
            </Card>
          </Link>
        </Col>
        <Col md={6} xl={4} key="occupied">
          <Link to={getLink(`/mission`)}>
            <Card borderBottomColor="#FEB951">
              <CardTitle>Places occupées</CardTitle>
              <CardValueWrapper>
                <CardValue>{missionPlaceTotal - missionPlaceLeft}</CardValue>
                {/* <CardPercentage>
                  {`${missionPlaceTotal ? (((missionPlaceTotal - missionPlaceLeft) * 100) / missionPlaceTotal).toFixed(0) : `0`}%`}
                  <CardArrow />
                </CardPercentage> */}
              </CardValueWrapper>
            </Card>
          </Link>
        </Col>
        <Col md={6} xl={4} key="available">
          <Link to={getLink(`/mission`)}>
            <Card borderBottomColor="#6BC763">
              <CardTitle>Places disponibles</CardTitle>
              <CardValueWrapper>
                <CardValue>{missionPlaceLeft}</CardValue>
                {/* <CardPercentage>
                  {`${missionPlaceTotal ? ((missionPlaceLeft * 100) / missionPlaceTotal).toFixed(0) : `0`}%`}
                  <CardArrow />
                </CardPercentage> */}
              </CardValueWrapper>
            </Card>
          </Link>
        </Col>
      </Row>
    </React.Fragment>
  );
};
