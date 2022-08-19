import React from "react";
import { Col, Row } from "reactstrap";
import { Box, BoxContent, BoxHeadTitle } from "../../../components/box";
import Documents from "../components/Documents";
import DndFileInput from "../../../components/dndFileInputV2";

export default function MilitaryPreparation({ values }) {
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
              <Col md={6} key={file.name}>
                <Documents key={file.name}>
                  <h4>{file.placeholder}</h4>
                  <DndFileInput
                    placeholder="un document justificatif"
                    errorMessage="Vous devez téléverser le document"
                    value={values.files[file.name]}
                    path={`/young/${values._id}/documents/${file.name}`}
                    name={file.name}
                  />
                </Documents>
              </Col>
            ))}
          </Row>
        </BoxContent>
      </Box>
    </Col>
  );
}
