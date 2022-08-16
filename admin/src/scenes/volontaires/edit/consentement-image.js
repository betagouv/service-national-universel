import React from "react";
import { Col } from "reactstrap";

import { Box, BoxContent, BoxHeadTitle } from "../../../components/box";
import Select from "../components/Select";
import Documents from "../components/Documents";
import DndFileInput from "../../../components/dndFileInput";

export default function ConsentmentImage({ values, handleChange }) {
  return (
    <Col md={6} style={{ marginBottom: "20px" }}>
      <Box>
        <BoxHeadTitle>Consentement de droit à l&apos;image</BoxHeadTitle>
        <BoxContent direction="column">
          <Select
            name="imageRight"
            values={values}
            handleChange={handleChange}
            title="Autorisation"
            options={[
              { value: "true", label: "Oui" },
              { value: "false", label: "Non" },
            ]}
          />
          <Documents>
            <h4>Formulaire de consentement de droit à l&apos;image</h4>
            <DndFileInput
              placeholder="un document justificatif"
              errorMessage="Vous devez téléverser un document justificatif"
              value={values.files.imageRightFiles}
              path={`/young/${values._id}/documents/imageRightFiles`}
              name="imageRightFiles"
            />
          </Documents>
        </BoxContent>
      </Box>
    </Col>
  );
}
