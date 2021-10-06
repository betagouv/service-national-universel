import React, { useEffect } from "react";
import { Col, Row } from "reactstrap";
import { toastr } from "react-redux-toastr";

import api from "../../../services/api";
import { Box, BoxContent, BoxHeadTitle } from "../../../components/box";
import Documents from "../components/Documents";
import DndFileInput from "../../../components/dndFileInput";

export default ({ values, handleChange, handleSubmit }) => {
  useEffect(() => {
    console.log(values);
  }, []);

  const files = [
    { name: "militaryPreparationFilesIdentity", placeholder: "Pièce d’identité en cours de validité (CNI, passeport)" },
    { name: "militaryPreparationFilesCensus", placeholder: "Attestation de recensement" },
    { name: "militaryPreparationFilesAuthorization", placeholder: "Consentement à la participation à une préparation militaire" },
    { name: "militaryPreparationFilesCertificate", placeholder: "Certificat d’absence de contre-indication à la pratique sportive" },
  ];

  return (
    <Col md={12} style={{ marginBottom: "20px" }}>
      <Box>
        <BoxHeadTitle>Documents préparation militaire</BoxHeadTitle>
        <BoxContent direction="column">
          <Row>
            {files.map((file) => (
              <Col md={6}>
                <Documents key={file.name}>
                  <h4>{file.placeholder}</h4>
                  <DndFileInput
                    placeholder="un document justificatif"
                    errorMessage="Vous devez téléverser le document"
                    value={values[file.name]}
                    source={(e) => api.get(`/referent/youngFile/${values._id}/${file.name}/${e}`)}
                    name={file.name}
                    onChange={async (e) => {
                      const res = await api.uploadFile(`/referent/file/${file.name}`, e.target.files, { youngId: values._id });
                      if (res.code === "FILE_CORRUPTED") {
                        return toastr.error(
                          "Le fichier semble corrompu",
                          "Pouvez vous changer le format ou regénérer votre fichier ? Si vous rencontrez toujours le problème, contactez le support inscription@snu.gouv.fr",
                          { timeOut: 0 }
                        );
                      }
                      if (!res.ok) return toastr.error("Une erreur s'est produite lors du téléversement de votre fichier");
                      // We update and save it instant.
                      handleChange({ target: { value: res.data, name: file.name } });
                      handleSubmit();
                    }}
                  />
                </Documents>
              </Col>
            ))}
          </Row>
        </BoxContent>
      </Box>
    </Col>
  );
};
