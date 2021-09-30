import React from "react";
import { Col, Row } from "reactstrap";
import { Link } from "react-router-dom";

import { translate } from "../../../../utils";
import { CardArrow, Card, CardTitle, CardSection, CardValueWrapper, CardValue, CardPercentage, Subtitle } from "../../../../components/dashboard";

export default ({ sectionTitle, title, obj, filterName, colors, data, getLink, filter }) => {
  const total = Object.keys(data).reduce((acc, a) => acc + data[a], 0);
  return (
    <>
      <Row>
        <Col md={12}>
          {sectionTitle ? <CardSection>{sectionTitle}</CardSection> : null}
          <Subtitle>{title}</Subtitle>
        </Col>
      </Row>
      <Row>
        {Object.values(obj).map((e) => {
          return (
            <Col md={6} xl={4} key={e}>
              <Link to={getLink({ base: `/volontaire`, filter, filtersUrl: [`STATUS=%5B"VALIDATED"%5D&${filterName}=%5B"${e}"%5D`] })}>
                <Card borderBottomColor={colors[e]}>
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
    </>
  );
};
