import React from "react";
import { Col } from "reactstrap";

import { Box, BoxContent, BoxHeadTitle } from "../../../components/box";
import Select from "../components/Select";

export default function JDC({ values, handleChange }) {
  return (
    <Col md={6} style={{ marginBottom: "20px" }}>
      <Box>
        <BoxHeadTitle>Journée de Défense et Citoyenneté (cohorte 2020)</BoxHeadTitle>
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
}
