import React, { useEffect, useState } from "react";
import { Col, Row } from "reactstrap";
import { useSelector } from "react-redux";
import { YOUNG_STATUS_COLORS } from "../../../utils";
import { Card, CardTitle, CardValueWrapper, CardValue } from "../../../components/dashboard";

import api from "../../../services/api";

export default () => {
  const [placesTotal, setPlacesTotal] = useState(0);
  const [placesLeft, setPlacesLeft] = useState(0);
  const user = useSelector((state) => state.Auth.user);

  useEffect(() => {
    (async () => {
      const { data, ok, code } = await api.get(`/cohesion-center/${user.cohesionCenterId}`);
      if (!ok) return console.log(code);
      setPlacesTotal(data.placesTotal);
      setPlacesLeft(data.placesLeft);
    })();
  }, []);

  return (
    <Row>
      <Col md={6} xl={3}>
        <Card borderBottomColor="#FEB951">
          <CardTitle>Places proposées</CardTitle>
          <CardValueWrapper>
            <CardValue>{placesTotal}</CardValue>
          </CardValueWrapper>
        </Card>
      </Col>
      <Col md={6} xl={3}>
        <Card borderBottomColor="#6BC763">
          <CardTitle>Places disponibles</CardTitle>
          <CardValueWrapper>
            <CardValue>{placesLeft}</CardValue>
          </CardValueWrapper>
        </Card>
      </Col>
      <Col md={6} xl={3}>
        <Card borderBottomColor={YOUNG_STATUS_COLORS.IN_PROGRESS}>
          <CardTitle>Taux d'occupation</CardTitle>
          <CardValueWrapper>
            <CardValue>{placesTotal ? `${(((placesTotal - placesLeft || 0) * 100) / placesTotal).toFixed(2)}%` : `0%`}</CardValue>
          </CardValueWrapper>
        </Card>
      </Col>
    </Row>
  );
};
