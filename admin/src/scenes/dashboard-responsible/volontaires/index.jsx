import React from "react";
import { Col, Row } from "reactstrap";

import Applications from "./applications";

export default function Index() {
  return (
    <>
      <Row style={{}}>
        <Col md={6}>
          <h2 className="m-0 text-2xl font-bold">Volontaires</h2>
        </Col>
      </Row>
      <Applications />
    </>
  );
}
