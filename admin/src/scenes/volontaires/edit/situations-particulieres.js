import React from "react";
import { Row, Col } from "reactstrap";
import { Field } from "formik";

import { departmentList, regionList, isInRuralArea, translate } from "../../../utils";
import { Box, BoxContent, BoxHeadTitle } from "../../../components/box";
import Item from "../components/Item";
import Select from "../components/Select";
import Documents from "../components/Documents";
import DndFileInput from "../../../components/dndFileInput";

export default function SituationParticulieres({ values, handleChange }) {
  return (
    <Col md={6} style={{ marginBottom: "20px" }}>
      <Box>
        <BoxHeadTitle>Situations particulières</BoxHeadTitle>
        <BoxContent direction="column">
          <Item disabled title="Quartier Prioritaire de la Ville" values={values} name="qpv" />
          <Row className="detail">
            <Col md={4}>
              <label>Zone Rurale</label>
            </Col>
            <Col md={8}>
              <Field disabled className="form-control" value={translate(isInRuralArea(values))} />
            </Col>
          </Row>
          <Select
            name="handicap"
            values={values}
            handleChange={handleChange}
            title="Situation de Handicap"
            options={[
              { value: "true", label: "Oui" },
              { value: "false", label: "Non" },
            ]}
          />
          <Select
            name="ppsBeneficiary"
            values={values}
            handleChange={handleChange}
            title="Bénéficiaire d'un PPS"
            options={[
              { value: "true", label: "Oui" },
              { value: "false", label: "Non" },
            ]}
          />
          <Select
            name="paiBeneficiary"
            values={values}
            handleChange={handleChange}
            title="Bénéficiaire d'un PAI"
            options={[
              { value: "true", label: "Oui" },
              { value: "false", label: "Non" },
            ]}
          />
          <Select
            name="specificAmenagment"
            values={values}
            handleChange={handleChange}
            title="Aménagement spécifique"
            options={[
              { value: "true", label: "Oui" },
              { value: "false", label: "Non" },
            ]}
          />
          <Item
            disabled={values.specificAmenagment !== "true"}
            title="Nature de l'aménagement spécifique"
            values={values}
            name="specificAmenagmentType"
            handleChange={handleChange}
          />
          <Select
            name="reducedMobilityAccess"
            values={values}
            handleChange={handleChange}
            title="Aménagement pour mobilité réduite"
            options={[
              { value: "true", label: "Oui" },
              { value: "false", label: "Non" },
            ]}
          />
          <Select
            name="handicapInSameDepartment"
            values={values}
            handleChange={handleChange}
            title="Besoin d'être affecté(e) dans le département de résidence"
            options={[
              { value: "true", label: "Oui" },
              { value: "false", label: "Non" },
            ]}
          />
          <Select
            name="allergies"
            values={values}
            handleChange={handleChange}
            title="Allergies ou intolérances"
            options={[
              { value: "true", label: "Oui" },
              { value: "false", label: "Non" },
            ]}
          />
          <Select
            disabled={values.ppsBeneficiary !== "true" && values.handicap !== "true"}
            name="medicosocialStructure"
            values={values}
            handleChange={handleChange}
            title="Suivi médicosocial"
            options={[
              { value: "true", label: "Oui" },
              { value: "false", label: "Non" },
            ]}
          />
          <Item
            disabled={values.medicosocialStructure !== "true"}
            title="Nom de la structure médicosociale"
            values={values}
            name="medicosocialStructureName"
            handleChange={handleChange}
          />
          <Item
            title="Adresse de la structure médicosociale"
            values={values}
            name="medicosocialStructureAddress"
            handleChange={handleChange}
            disabled={values.medicosocialStructure !== "true"}
          />
          <Item
            title="Ville de la structure médicosociale"
            values={values}
            name="medicosocialStructureCity"
            handleChange={handleChange}
            disabled={values.medicosocialStructure !== "true"}
          />
          <Item
            title="Code Postal de la structure médicosociale"
            values={values}
            name="medicosocialStructureZip"
            handleChange={handleChange}
            disabled={values.medicosocialStructure !== "true"}
          />
          <Select
            disabled={values.medicosocialStructure !== "true"}
            name="medicosocialStructureDepartment"
            values={values}
            handleChange={handleChange}
            title="Département de la structure médicosociale"
            options={departmentList.map((d) => ({ value: d, label: d }))}
          />
          <Select
            disabled={values.medicosocialStructure !== "true"}
            name="medicosocialStructureRegion"
            values={values}
            handleChange={handleChange}
            title="Région de la structure médicosociale"
            options={regionList.map((r) => ({ value: r, label: r }))}
          />
          <Select
            name="highSkilledActivity"
            values={values}
            handleChange={handleChange}
            title="Activités de haut niveau"
            options={[
              { value: "true", label: "Oui" },
              { value: "false", label: "Non" },
            ]}
          />
          <Select
            name="highSkilledActivityInSameDepartment"
            values={values}
            handleChange={handleChange}
            title="Activités de haut niveau nécessitant d'être affecté dans le département de résidence"
            options={[
              { value: "true", label: "Oui" },
              { value: "false", label: "Non" },
            ]}
          />
          <Item
            disabled={values.highSkilledActivity !== "true"}
            title="Nature de l'activité de haut-niveau"
            values={values}
            name="highSkilledActivityType"
            handleChange={handleChange}
          />
          <Documents>
            <h4>Documents justificatifs</h4>
            <DndFileInput
              placeholder="un document justificatif"
              errorMessage="Vous devez téléverser un document justificatif"
              value={values.files.highSkilledActivityProofFiles}
              path={`/referent/files/${values._id}/highSkilledActivityProofFiles`}
              name="highSkilledActivityProofFiles"
            />
          </Documents>
        </BoxContent>
      </Box>
    </Col>
  );
}
