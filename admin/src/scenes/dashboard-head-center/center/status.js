import React, { useEffect, useState } from "react";
import { Col, Row } from "reactstrap";
import { useSelector } from "react-redux";
import { CardComponent } from "../../../components/dashboard";
import { colors } from "../../../utils";

import api from "../../../services/api";

export default function Status() {
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
        <CardComponent color={colors.yellow} title="Places proposées" value={placesTotal} />
      </Col>
      <Col md={6} xl={3}>
        <CardComponent color={colors.green} title="Places disponibles" value={placesLeft} />
      </Col>
      <Col md={6} xl={3}>
        <CardComponent color={colors.darkPurple} title="Taux d'occupation" value={placesTotal ? `${(((placesTotal - placesLeft || 0) * 100) / placesTotal).toFixed(2)}%` : `0%`} />
      </Col>
    </Row>
  );
}
