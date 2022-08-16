import React from "react";
import { Col } from "reactstrap";

import { Box, BoxContent, BoxHeadTitle } from "../../../components/box";
import Documents from "../components/Documents";
import DndFileInput from "../../../components/dndFileInput";

export default function ConsentmentImage({ values }) {
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
                value={values.files.dataProcessingConsentmentFiles}
                path={`/young/${values._id}/documents/dataProcessingConsentmentFiles`}
                name="dataProcessingConsentmentFiles"
              />
            </Documents>
          )}
        </BoxContent>
      </Box>
    </Col>
  );
}
