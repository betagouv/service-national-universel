import React from "react";
import { Col } from "reactstrap";
import { toastr } from "react-redux-toastr";

import api from "../../../services/api";

import Box from "../components/Box";
import BoxContent from "../components/BoxContent";
import BoxTitle from "../components/BoxTitle";
import Checkbox from "../components/Checkbox";
import Select from "../components/Select";
import Documents from "../components/Documents";
import DndFileInput from "../../../components/dndFileInput";

export default ({ values, handleChange, handleSubmit }) => {
  function isFromFranceConnect(values) {
    return values.parent1FromFranceConnect === "true" && (!values.parent2Status || values.parent2FromFranceConnect === "true");
  }

  return (
    <Col md={6} style={{ marginBottom: "20px" }}>
      <Box>
        <BoxTitle>Consentement des représentants légaux</BoxTitle>
        <BoxContent direction="column">
          <Select
            disabled={!values.parentConsentmentFiles.length}
            name="parentConsentmentFilesCompliant"
            values={values}
            handleChange={handleChange}
            title="Consentement"
            options={[
              { value: "true", label: "Conforme" },
              { value: "false", label: "Non conforme" },
            ]}
          />
          {values.parentConsentmentFilesCompliant === "false" ? (
            <>
              <Checkbox
                name="parentConsentmentFilesCompliantInfo"
                value="signature"
                values={values}
                handleChange={handleChange}
                description="Manque de la signature d'un des représentants"
              />
              <Checkbox
                name="parentConsentmentFilesCompliantInfo"
                value="proof"
                values={values}
                handleChange={handleChange}
                description="Manque d'un justificatif d'autorité parentale non partagée"
              />
              <Checkbox name="parentConsentmentFilesCompliantInfo" value="other" values={values} handleChange={handleChange} description="Autre" />
            </>
          ) : null}
          <Documents>
            <h4>Attestations des représentants légaux</h4>
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
                value={values.parentConsentmentFiles}
                source={(e) => api.get(`/referent/youngFile/${values._id}/parentConsentmentFiles/${e}`)}
                name="cniFiles"
                onChange={async (e) => {
                  const res = await api.uploadFile("/referent/file/parentConsentmentFiles", e.target.files, { youngId: values._id });
                  if (res.code === "FILE_CORRUPTED") {
                    return toastr.error(
                      "Le fichier semble corrompu",
                      "Pouvez vous changer le format ou regénérer votre fichier ? Si vous rencontrez toujours le problème, contactez le support inscription@snu.gouv.fr",
                      { timeOut: 0 }
                    );
                  }
                  if (!res.ok) return toastr.error("Une erreur s'est produite lors du téléversement de votre fichier");
                  // We update and save it instant.
                  handleChange({ target: { value: res.data, name: "parentConsentmentFiles" } });
                  handleSubmit();
                }}
              />
            )}
          </Documents>
        </BoxContent>
      </Box>
    </Col>
  );
};
