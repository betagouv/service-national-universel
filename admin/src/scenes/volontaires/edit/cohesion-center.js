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
          onAffect={(e) => {
            handleChange({ target: { name: "cohesionCenterId", value: e._id } });
            handleChange({ target: { name: "cohesionCenterName", value: e.name } });
            handleChange({ target: { name: "cohesionCenterZip", value: e.zip } });
            handleChange({ target: { name: "cohesionCenterCity", value: e.city } });
          }}
        />
        <Item disabled title="Centre de cohésion" values={values} name="cohesionCenterName" handleChange={handleChange} />
        <Item disabled title="Code postal centre de cohésion" values={values} name="cohesionCenterZip" handleChange={handleChange} />
        <Item disabled title="Ville centre de cohésion" values={values} name="cohesionCenterCity" handleChange={handleChange} />
      </BoxContent>
    </Box>
  </Col>
);
