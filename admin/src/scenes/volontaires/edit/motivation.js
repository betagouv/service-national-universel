import React from "react";
import { Col } from "reactstrap";

import Box from "../components/Box";
import BoxContent from "../components/BoxContent";
import BoxTitle from "../components/BoxTitle";

export default ({ values }) => (
  <Col md={6} style={{ marginBottom: "20px" }}>
    <Box>
      <BoxTitle>Motivations</BoxTitle>
      <BoxContent direction="column" style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
        <div className="quote">{values.motivations ? `« ${values.motivations} »` : "Non renseignées"}</div>
      </BoxContent>
    </Box>
  </Col>
);
