import React from "react";
import { Col } from "reactstrap";
import { toastr } from "react-redux-toastr";

import api from "../../../services/api";

import { Box, BoxContent, BoxHeadTitle } from "../../../components/box";
import Select from "../components/Select";
import Documents from "../components/Documents";
import DndFileInput from "../../../components/dndFileInput";

export default function Rules({ values, handleChange, handleSubmit }) {
  return (
    <Col md={6} style={{ marginBottom: "20px" }}>
      <Box>
        <BoxHeadTitle>Règlement intérieur</BoxHeadTitle>
        <BoxContent direction="column">
          <Select
            name="rulesYoung"
            values={values}
            handleChange={handleChange}
            title="Autorisation (volontaire)"
            options={[
              { value: "true", label: "Oui" },
              { value: "false", label: "Non" },
            ]}
          />
          <Select
            name="rulesParent1"
            values={values}
            handleChange={handleChange}
            title="Autorisation (repres. légal 1)"
            options={[
              { value: "true", label: "Oui" },
              { value: "false", label: "Non" },
            ]}
          />
          <Select
            name="rulesParent2"
            values={values}
            handleChange={handleChange}
            title="Autorisation (repres. légal 2)"
            options={[
              { value: "true", label: "Oui" },
              { value: "false", label: "Non" },
            ]}
          />
          <Documents>
            <h4>Document règlement intérieur</h4>
            <DndFileInput
              placeholder="un document justificatif"
              errorMessage="Vous devez téléverser un document justificatif"
              value={values.files.rulesFiles}
              path={`/referent/files/${values._id}/rulesFiles`}
              name="rulesFiles"
            />
          </Documents>
        </BoxContent>
      </Box>
    </Col>
  );
}
