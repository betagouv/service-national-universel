import React from "react";
import { Col } from "reactstrap";

import { translate, YOUNG_PHASE, YOUNG_STATUS_PHASE1, YOUNG_STATUS_PHASE2, YOUNG_STATUS_PHASE3 } from "../../../utils";
import Box from "../components/Box";
import BoxContent from "../components/BoxContent";
import BoxTitle from "../components/BoxTitle";
import Item from "../components/Item";

export default ({ values, handleChange }) => (
  <Col md={6} style={{ marginBottom: "20px" }}>
    <Box>
      <BoxTitle>Informations Phase 1</BoxTitle>
      <BoxContent direction="column">
        <Item title="Centre de cohésion" values={values} name="cohesionCenterName" handleChange={handleChange} />
        <Item title="Code postal centre de cohésion" values={values} name="cohesionCenterZip" handleChange={handleChange} />
        <Item title="Ville centre de cohésion" values={values} name="cohesionCenterCity" handleChange={handleChange} />
      </BoxContent>
    </Box>
  </Col>
);
