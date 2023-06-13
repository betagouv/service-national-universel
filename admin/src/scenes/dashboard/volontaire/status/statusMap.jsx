import React from "react";
import { Col, Row } from "reactstrap";
import { Link } from "react-router-dom";

import { translate, translatePhase1, translatePhase2, translateApplication, translateEngagement, translateEquivalenceStatus } from "../../../../utils";
import { CardArrow, Card, CardTitle, CardSection, CardValueWrapper, CardValue, CardPercentage, Subtitle } from "../../../../components/dashboard";

export default function StatusMap({ sectionTitle, title, obj, filterName, colors, data, getLink, filter }) {
  const total = Object.keys(data).reduce((acc, a) => acc + data[a], 0);
  const translator = (el) => {
    if (filterName === "phase2ApplicationStatus") {
      return translateApplication(el);
    } else if (filterName === "statusPhase1") {
      return translatePhase1(el);
    } else if (filterName === "statusPhase2") {
      return translatePhase2(el);
    } else if (filterName === "statusPhase2Contract") {
      return translateEngagement(el);
    } else if (filterName === "status_equivalence") {
      return translateEquivalenceStatus(el);
    } else {
      return translate(el);
    }
  };
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
              <Link to={getLink({ base: `/volontaire`, filter, filtersUrl: [`status=VALIDATED&${filterName}=${e}`] })}>
                <Card borderBottomColor={colors[e]}>
                  <CardTitle>{translator(e)}</CardTitle>
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
}
