import React from "react";
import { Col } from "reactstrap";

import { Box, BoxContent, BoxTitle } from "../../../components/box";

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
