import React from "react";
import { Col } from "reactstrap";
import { toastr } from "react-redux-toastr";

import api from "../../../services/api";

import { Box, BoxContent, BoxHeadTitle } from "../../../components/box";
import Select from "../components/Select";
import Documents from "../components/Documents";
import DndFileInput from "../../../components/dndFileInput";

export default ({ values, handleChange, handleSubmit }) => (
  <Col md={6} style={{ marginBottom: "20px" }}>
    <Box>
      <BoxHeadTitle>Consentement à l'utilisation d'autotest PCR</BoxHeadTitle>
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
          <h4>Formulaire de consentement d'autotest PCR</h4>
          <DndFileInput
            placeholder="un document justificatif"
            errorMessage="Vous devez téléverser un document justificatif"
            value={values.autoTestPCRFiles}
            source={(e) => api.get(`/referent/youngFile/${values._id}/autoTestPCRFiles/${e}`)}
            name="autoTestPCRFiles"
            onChange={async (e) => {
              const res = await api.uploadFile("/referent/file/autoTestPCRFiles", e.target.files, { youngId: values._id });
              if (res.code === "FILE_CORRUPTED") {
                return toastr.error(
                  "Le fichier semble corrompu",
                  "Pouvez vous changer le format ou regénérer votre fichier ? Si vous rencontrez toujours le problème, contactez le support inscription@snu.gouv.fr",
                  { timeOut: 0 }
                );
              }
              if (!res.ok) return toastr.error("Une erreur s'est produite lors du téléversement de votre fichier");
              // We update and save it instant.
              handleChange({ target: { value: res.data, name: "autoTestPCRFiles" } });
              handleSubmit();
            }}
          />
        </Documents>
      </BoxContent>
    </Box>
  </Col>
);
