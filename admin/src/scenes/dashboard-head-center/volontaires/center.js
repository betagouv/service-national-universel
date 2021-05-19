import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { Col, Row } from "reactstrap";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { YOUNG_STATUS_COLORS } from "../../../utils";

import api from "../../../services/api";

export default ({ filter }) => {
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
  }, [JSON.stringify(filter)]);

  const replaceSpaces = (v) => v.replace(/\s+/g, "+");

  const getLink = (link) => {
    if (filter.region) link += `REGION=%5B"${replaceSpaces(filter.region)}"%5D`;
    if (filter.department) link += `&DEPARTMENT=%5B"${replaceSpaces(filter.department)}"%5D`;
    return link;
  };

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

const Card = styled.div`
  /* max-width: 325px; */
  padding: 22px 15px;
  border-bottom: 7px solid ${(props) => props.borderBottomColor};
  border-radius: 8px;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.05);
  background-color: #fff;
  margin-bottom: 33px;
`;
const CardTitle = styled.h3`
  color: #171725;
  font-size: 16px;
  font-weight: bold;
`;

const CardValueWrapper = styled.div`
  position: relative;
  display: flex;
  justify-content: space-between;
`;
const CardValue = styled.span`
  font-size: 28px;
`;
const CardArrow = styled.span`
  position: absolute;
  top: 50%;
  right: 0;
  transform: translateY(-50%);
  width: 15px;
  height: 15px;
  background-image: url(${require("../../../assets/arrow.png")});
`;
