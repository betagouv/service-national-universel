import React from "react";
import { Col, Row } from "reactstrap";
import { Link } from "react-router-dom";

import { translate, CONTRACT_STATUS, CONTRACT_STATUS_COLORS } from "../../../../utils";
import { CardArrow, Card, CardTitle, CardValueWrapper, CardValue, CardPercentage, Subtitle } from "../../../../components/dashboard";

export default ({ data, getLink }) => {
  const total = Object.keys(data).reduce((acc, a) => acc + data[a], 0);
  return (
    <React.Fragment>
      <Row>
        <Col md={12}>
          <Subtitle>Statut sur des contrats d'engagement</Subtitle>
        </Col>
      </Row>
      <Row>
        {Object.values(CONTRACT_STATUS).map((e) => {
          return (
            <Col md={6} xl={4} key={e}>
              <Link to={getLink(`/volontaire?CONTRACT_STATUS=%5B"${e}"%5D`)}>
                <Card borderBottomColor={CONTRACT_STATUS_COLORS[e]}>
                  <CardTitle>{translate(e)}</CardTitle>
                  <CardValueWrapper>
                    <CardValue>{data[e] || 0}</CardValue>
                    <CardPercentage>
                      {total ? `${(((data[e] || 0) * 100) / total).toFixed(0)}%` : `0%`}
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
};
