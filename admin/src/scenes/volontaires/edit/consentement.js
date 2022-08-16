import React from "react";
import { Col } from "reactstrap";
import { Box, BoxContent, BoxHeadTitle } from "../../../components/box";
import Documents from "../components/Documents";
import DndFileInput from "../../../components/dndFileInput";

export default function Consentement({ values }) {
  function isFromFranceConnect(values) {
    return values.parent1FromFranceConnect === "true" && (!values.parent2Status || values.parent2FromFranceConnect === "true");
  }

  return (
    <Col md={6} style={{ marginBottom: "20px" }}>
      <Box>
        <BoxHeadTitle>Consentement des représentants légaux</BoxHeadTitle>
        <BoxContent direction="column">
          <Documents>
            {/* <h4>Attestations des représentants légaux</h4> */}
            {isFromFranceConnect(values) ? (
              <div style={{ marginTop: "1rem" }}>
                <img src={require("../../../assets/fc_logo_v2.png")} height={60} />
                <br />
                <b>Consentement parental validé via FranceConnect.</b>
                <br />
                Les représentants légaux ont utilisé FranceConnect pour s’identifier et consentir, ce qui permet de s’affranchir du document de consentement papier.
              </div>
            ) : (
              <DndFileInput
                placeholder="un document justificatif"
                errorMessage="Vous devez téléverser un document justificatif"
                value={values.files.parentConsentmentFiles}
                path={`/young/${values._id}/documents/parentConsentmentFiles`}
                name="parentConsentmentFiles"
              />
            )}
          </Documents>
        </BoxContent>
      </Box>
    </Col>
  );
}
