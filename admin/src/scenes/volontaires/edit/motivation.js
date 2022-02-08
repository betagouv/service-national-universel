import React from "react";
import { Col } from "reactstrap";

import { Box, BoxContent, BoxHeadTitle } from "../../../components/box";

export default function Motivation({ values }) {
  return (
    <Col md={6} style={{ marginBottom: "20px" }}>
      <Box>
        <BoxHeadTitle>Motivations</BoxHeadTitle>
        <BoxContent direction="column" style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
          <div className="quote">{values.motivations ? `« ${values.motivations} »` : "Non renseignées"}</div>
        </BoxContent>
      </Box>
    </Col>
  );
}
