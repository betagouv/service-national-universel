import React from "react";
import { Col } from "reactstrap";

import { Box, BoxContent, BoxHeadTitle } from "../../../components/box";
import Select from "../components/Select";
import Documents from "../components/Documents";
import DndFileInput from "../../../components/dndFileInputV2";

export default function ConsentementPcr({ values, handleChange }) {
  return (
    <Col md={6} style={{ marginBottom: "20px" }}>
      <Box>
        <BoxHeadTitle>Consentement à l&apos;utilisation d&apos;autotest PCR</BoxHeadTitle>
        <BoxContent direction="column">
          <Select
            name="autoTestPCR"
            values={values}
            handleChange={handleChange}
            title="Autorisation"
            options={[
              { value: "true", label: "Oui" },
              { value: "false", label: "Non" },
            ]}
          />
          <Documents>
            <h4>Formulaire de consentement d&apos;autotest PCR</h4>
            <DndFileInput
              placeholder="un document justificatif"
              errorMessage="Vous devez téléverser un document justificatif"
              value={values.files.autoTestPCRFiles}
              path={`/young/${values._id}/documents/autoTestPCRFiles`}
              name="autoTestPCRFiles"
            />
          </Documents>
        </BoxContent>
      </Box>
    </Col>
  );
}
