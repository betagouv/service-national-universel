import React, { useEffect, useState } from "react";
import { Col, Row } from "reactstrap";
import { Link } from "react-router-dom";
import { CardArrow, Card, CardTitle, CardValueWrapper, CardValue, CardPercentage, CardSubtitle } from "../../../components/dashboard";
import { translate, MISSION_STATUS, MISSION_STATUS_COLORS } from "../../../utils";

export default function Status({ data, filter, getLink }) {
  const [total, setTotal] = useState();

  useEffect(() => {
    if (Object.keys(data).length !== 0) {
      setTotal(Object.keys(data).reduce((acc, a) => acc + data[a].doc_count, 0));
    }
  }, [data]);

  if (Object.keys(data).length === 0) {
    return null;
  }

  return (
    <React.Fragment>
      <h3 className="mt-4 mb-2 text-xl">Statut des missions proposées par les structures</h3>
      <Row>
        {Object.values(MISSION_STATUS).map((l, k) => {
          return (
            <Col md={6} xl={3} key={k}>
              <Link to={getLink({ base: `/mission`, filter, filtersUrl: [`STATUS=%5B"${l}"%5D`] })}>
                <Card borderBottomColor={MISSION_STATUS_COLORS[l]}>
                  <CardTitle>{translate(l)}</CardTitle>
                  <CardValueWrapper>
                    <CardValue>{data[l]?.doc_count || 0}</CardValue>
                    <CardPercentage>
                      {total ? `${(((data[l]?.doc_count || 0) * 100) / total).toFixed(0)}%` : `0%`}
                      <CardArrow />
                    </CardPercentage>
                  </CardValueWrapper>
                  <CardSubtitle className="py-2">Places disponibles: {data[l]?.placesLeft || 0}</CardSubtitle>
                  <CardSubtitle>Places totales: {data[l]?.placesTotal || 0}</CardSubtitle>
                </Card>
              </Link>
            </Col>
          );
        })}
      </Row>
    </React.Fragment>
  );
}
