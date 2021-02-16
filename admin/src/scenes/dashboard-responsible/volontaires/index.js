import React, { useEffect, useState, useReducer } from "react";
import styled from "styled-components";
import { Col, Row, Input } from "reactstrap";

import Applications from "./applications";

export default () => {
  return (
    <>
      <Row style={{}}>
        <Col md={12}>
          <Title>Volontaires</Title>
        </Col>
      </Row>
      <Applications />
    </>
  );
};

// Title line with filters
const Title = styled.h2`
  color: #242526;
  font-weight: bold;
  font-size: 28px;
  margin-bottom: 10px;
`;
