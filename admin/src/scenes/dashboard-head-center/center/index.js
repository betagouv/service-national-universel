import React from "react";
import { Col, Row } from "reactstrap";

import Status from "./status";

export default function Index() {
  return (
    <>
      <Row style={{}}>
        <Col md={12}>
          <h2 className="m-0 text-2xl font-bold">Centre</h2>
        </Col>
      </Row>
      <Status />
    </>
  );
}
