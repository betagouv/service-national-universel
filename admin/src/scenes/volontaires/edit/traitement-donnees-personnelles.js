import React from "react";
import { Col } from "reactstrap";
import { toastr } from "react-redux-toastr";

import api from "../../../services/api";

import { Box, BoxContent, BoxHeadTitle } from "../../../components/box";
import Documents from "../components/Documents";
import DndFileInput from "../../../components/dndFileInput";

export default function ConsentmentImage({ values, handleChange, handleSubmit }) {
  const isFromFranceConnect = () => {
    return values.parent1FromFranceConnect === "true" && (!values.parent2Status || values.parent2FromFranceConnect === "true");
  };

  return (
    <Col md={6} style={{ marginBottom: "20px" }}>
      <Box>
        <BoxHeadTitle>Traitement des données personnelles</BoxHeadTitle>
        <BoxContent direction="column">
          {isFromFranceConnect(values) ? (
            <div>
              <img src={require("../../../assets/fc_logo_v2.png")} height={60} width={200} />
              <br />
              <b>Consentement parental validé via FranceConnect.</b>
              <br />
              Les représentants légaux ont utilisé FranceConnect pour s’identifier et consentir, ce qui permet de s’affranchir du document de consentement papier.
            </div>
          ) : (
            <Documents>
              <DndFileInput
                placeholder="un document justificatif"
                errorMessage="Vous devez téléverser un document justificatif"
                value={values.dataProcessingConsentmentFiles}
                source={(e) => api.get(`/referent/youngFile/${values._id}/dataProcessingConsentmentFiles/${e}`)}
                name="dataProcessingConsentmentFiles"
                onChange={async (e) => {
                  const res = await api.uploadFile("/referent/file/dataProcessingConsentmentFiles", e.target.files, { youngId: values._id });
                  if (res.code === "FILE_CORRUPTED") {
                    return toastr.error(
                      "Le fichier semble corrompu",
                      "Pouvez vous changer le format ou regénérer votre fichier ? Si vous rencontrez toujours le problème, contactez le support inscription@snu.gouv.fr",
                      { timeOut: 0 },
                    );
                  }
                  if (!res.ok) return toastr.error("Une erreur s'est produite lors du téléversement de votre fichier");
                  // We update and save it instant.
                  handleChange({ target: { value: res.data, name: "dataProcessingConsentmentFiles" } });
                  handleSubmit();
                }}
              />
            </Documents>
          )}
        </BoxContent>
      </Box>
    </Col>
  );
}
