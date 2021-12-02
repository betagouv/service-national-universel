import React from "react";
import { Col, Row } from "reactstrap";
import { Link } from "react-router-dom";
import { CardArrow, Card, CardTitle, CardValueWrapper, CardValue, CardPercentage, Subtitle } from "../../../components/dashboard";
import { translate, MISSION_STATUS, MISSION_STATUS_COLORS } from "../../../utils";

export default function Status({ data, filter, getLink }) {
  const total = Object.keys(data).reduce((acc, a) => acc + data[a], 0);
  return (
    <React.Fragment>
      <Subtitle>Statut des missions proposées par les structures</Subtitle>
      <Row>
        {Object.values(MISSION_STATUS).map((l, k) => {
          return (
            <Col md={6} xl={3} key={k}>
              <Link to={getLink({ base: `/mission`, filter, filtersUrl: [`STATUS=%5B"${l}"%5D`] })}>
                <Card borderBottomColor={MISSION_STATUS_COLORS[l]}>
                  <CardTitle>{translate(l)}</CardTitle>
                  <CardValueWrapper>
                    <CardValue>{data[l] || 0}</CardValue>
                    <CardPercentage>
                      {total ? `${(((data[l] || 0) * 100) / total).toFixed(0)}%` : `0%`}
                      <CardArrow />
                    </CardPercentage>
                  </CardValueWrapper>
                </Card>
              </Link>
            </Col>
          );
        })}
      </Row>
    </React.Fragment>
  );
}
