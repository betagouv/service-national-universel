import React from "react";
import { Col } from "reactstrap";

import { translate, YOUNG_PHASE, YOUNG_STATUS, YOUNG_STATUS_PHASE1, YOUNG_STATUS_PHASE1_MOTIF, YOUNG_STATUS_PHASE2, YOUNG_STATUS_PHASE3 } from "../../../utils";
import { Box, BoxContent, BoxHeadTitle } from "../../../components/box";
import Select from "../components/Select";
import Item from "../components/Item";

export default function InformationsComplementaires({ values, handleChange }) {
  return (
    <Col md={6} style={{ marginBottom: "20px" }}>
      <Box>
        <BoxHeadTitle>Informations supplémentaire (admin)</BoxHeadTitle>
        <BoxContent direction="column">
          <Select
            name="cohort"
            values={values}
            handleChange={handleChange}
            placeholder="Sélectionnez une cohorte"
            title="Cohorte"
            options={[
              { value: "Juillet 2022", label: "Juillet 2022" },
              { value: "Juin 2022", label: "Juin 2022" },
              { value: "Février 2022", label: "Février 2022" },
              { value: "2022", label: "2022" },
              { value: "2021", label: "2021" },
              { value: "2020", label: "2020" },
              { value: "2019", label: "2019" },
            ]}
          />
          <Select name="phase" values={values} handleChange={handleChange} title="Phase" options={Object.keys(YOUNG_PHASE).map((s) => ({ value: s, label: translate(s) }))} />
          <Select name="status" values={values} handleChange={handleChange} title="Statut" options={Object.keys(YOUNG_STATUS).map((s) => ({ value: s, label: translate(s) }))} />
          <Select
            name="statusPhase1"
            values={values}
            handleChange={handleChange}
            title="Statut Phase 1"
            options={Object.keys(YOUNG_STATUS_PHASE1).map((s) => ({ value: s, label: translate(s) }))}
          />
          {values.statusPhase1 === YOUNG_STATUS_PHASE1.EXEMPTED && (
            <Select
              name="statusPhase1Motif"
              values={values}
              handleChange={handleChange}
              title="Motif du statut Phase 1"
              options={Object.keys(YOUNG_STATUS_PHASE1_MOTIF).map((s) => ({ value: s, label: translate(s) }))}
            />
          )}
          {values.statusPhase1Motif === YOUNG_STATUS_PHASE1_MOTIF.OTHER && (
            <Item title="Détail du motif de dispense" values={values} name="statusPhase1MotifDetail" handleChange={handleChange} />
          )}
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
}
