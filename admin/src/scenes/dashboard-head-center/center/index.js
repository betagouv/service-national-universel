import React from "react";
import styled from "styled-components";
import { Col, Row } from "reactstrap";

import Status from "./status";

export default function Index() {
  return (
    <>
      <Row style={{}}>
        <Col md={12}>
          <Title>Centre</Title>
        </Col>
      </Row>
      <Status />
    </>
  );
}

// Title line with filters
const Title = styled.h2`
  color: #242526;
  font-weight: bold;
  font-size: 28px;
  margin-bottom: 10px;
`;
