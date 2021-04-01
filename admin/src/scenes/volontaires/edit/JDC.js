import React from "react";
import { Col } from "reactstrap";

import Box from "../components/Box";
import BoxContent from "../components/BoxContent";
import BoxTitle from "../components/BoxTitle";
import Select from "../components/Select";

export default ({ values, handleChange }) => (
  <Col md={6} style={{ marginBottom: "20px" }}>
    <Box>
      <BoxTitle>Journée de Défense et Citoyenneté (cohorte 2020)</BoxTitle>
      <BoxContent direction="column">
        <Select
          name="jdc"
          values={values}
          handleChange={handleChange}
          title="JDC réalisée"
          options={[
            { value: "true", label: "Oui" },
            { value: "false", label: "Non" },
          ]}
        />
      </BoxContent>
    </Box>
  </Col>
);
