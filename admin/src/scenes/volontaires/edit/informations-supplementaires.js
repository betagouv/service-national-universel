import React from "react";
import { Col } from "reactstrap";

import { translate, YOUNG_STATUS_PHASE1, YOUNG_STATUS_PHASE2, YOUNG_STATUS_PHASE3 } from "../../../utils";
import Box from "../components/Box";
import BoxContent from "../components/BoxContent";
import BoxTitle from "../components/BoxTitle";
import Select from "../components/Select";

export default ({ values, handleChange }) => (
  <Col md={6} style={{ marginBottom: "20px" }}>
    <Box>
      <BoxTitle>Informations supplémentaire (admin)</BoxTitle>
      <BoxContent direction="column">
        <Select
          name="cohort"
          values={values}
          handleChange={handleChange}
          title="Cohorte"
          options={[
            { value: "2021", label: "2021" },
            { value: "2020", label: "2020" },
            { value: "2019", label: "2019" },
          ]}
        />
        <Select
          name="statusPhase1"
          values={values}
          handleChange={handleChange}
          title="Statut Phase 1"
          options={Object.keys(YOUNG_STATUS_PHASE1).map((s) => ({ value: s, label: translate(s) }))}
        />
        <Select
          name="statusPhase2"
          values={values}
          handleChange={handleChange}
          title="Statut Phase 2"
          options={Object.keys(YOUNG_STATUS_PHASE2).map((s) => ({ value: s, label: translate(s) }))}
        />
        <Select
          name="statusPhase3"
          values={values}
          handleChange={handleChange}
          title="Statut Phase 3"
          options={Object.keys(YOUNG_STATUS_PHASE3).map((s) => ({ value: s, label: translate(s) }))}
        />
      </BoxContent>
    </Box>
  </Col>
);
