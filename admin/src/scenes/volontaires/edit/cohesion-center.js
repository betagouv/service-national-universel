import React from "react";
import { Col } from "reactstrap";

import { Box, BoxContent, BoxHeadTitle } from "../../../components/box";
import Item from "../components/Item";
import AssignCenter from "../components/AssignCenter";

export default ({ values, handleChange }) => (
  <Col md={6} style={{ marginBottom: "20px" }}>
    <Box>
      <BoxHeadTitle>Centre de cohésion</BoxHeadTitle>
      <BoxContent direction="column">
        <AssignCenter
          young={values}
          onAffect={(center, young) => {
            handleChange({ target: { name: "cohesionCenterId", value: center._id } });
            handleChange({ target: { name: "cohesionCenterName", value: center.name } });
            handleChange({ target: { name: "cohesionCenterZip", value: center.zip } });
            handleChange({ target: { name: "cohesionCenterCity", value: center.city } });
            handleChange({ target: { name: "status", value: young.status } });
            handleChange({ target: { name: "statusPhase1", value: young.statusPhase1 } });
            handleChange({ target: { name: "autoAffectationPhase1ExpiresAt", value: young.autoAffectationPhase1ExpiresAt } });
          }}
        />
        <Item disabled title="Centre de cohésion" values={values} name="cohesionCenterName" handleChange={handleChange} />
        <Item disabled title="Code postal centre de cohésion" values={values} name="cohesionCenterZip" handleChange={handleChange} />
        <Item disabled title="Ville centre de cohésion" values={values} name="cohesionCenterCity" handleChange={handleChange} />
      </BoxContent>
    </Box>
  </Col>
);
