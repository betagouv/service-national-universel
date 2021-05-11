import React from "react";
import { Col } from "reactstrap";

import { Box, BoxContent, BoxHeadTitle } from "../../../components/box";
import Item from "../components/Item";

export default ({ values, handleChange }) => (
  <Col md={6} style={{ marginBottom: "20px" }}>
    <Box>
      <BoxHeadTitle>Informations Phase 1</BoxHeadTitle>
      <BoxContent direction="column">
        <Item title="Centre de cohésion" values={values} name="cohesionCenterName" handleChange={handleChange} />
        <Item title="Code postal centre de cohésion" values={values} name="cohesionCenterZip" handleChange={handleChange} />
        <Item title="Ville centre de cohésion" values={values} name="cohesionCenterCity" handleChange={handleChange} />
      </BoxContent>
    </Box>
  </Col>
);
