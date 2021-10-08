import React from "react";
import { Col } from "reactstrap";
import styled from "styled-components";
import { Formik, Field } from "formik";

export const SelectTag = ({ options, name, value, title, selectPlaceholder, handleChange }) => {
  return (
    <Col style={{ marginTop: 20 }}>
      <Label>{title}</Label>
      <Field
        as="select"
        className="form-control"
        name={name}
        value={value}
        onChange={(e) => {
          const optionSelected = options.find((o) => o.id === e.target.value);
          handleChange({ target: { name, value: optionSelected?.id } });
          handleChange({ target: { name: `${name}Tags`, value: optionSelected?.tags } });
        }}
      >
        <option value="" disabled>
          {selectPlaceholder}
        </option>
        {options?.map((option, i) => (
          <option value={option.id} label={option.label} key={i}>
            {option.label}
          </option>
        ))}
      </Field>
    </Col>
  );
};

export const step1 = [
  {
    id: "TECHNICAL",
    label: "J'ai un problème technique",
    tags: ["TAG_problème_technique", "AGENT_Startup_Support", "AGENT_Startup_Technique"],
  },
  {
    id: "QUESTION",
    label: "J'ai une question",
    tags: ["TAG_question", "AGENT_Startup_Support"],
  },
];

export const step2Technical = [
  {
    parentId: "TECHNICAL",
    id: "DOWNLOAD",
    label: "Je n'arrive pas à télécharger un document depuis la plateforme",
    tags: ["TAG_téléchargment"],
  },
  {
    parentId: "TECHNICAL",
    id: "UPLOAD",
    label: "Je n'arrive pas à téléverser (déposer) un document",
    tags: ["TAG_téléversement"],
  },
  {
    parentId: "TECHNICAL",
    id: "CONTRACT",
    label: "Je n'ai pas reçu le lien de validation du contrat d'engagement",
    tags: ["TAG_contrat_engagement"],
  },
  {
    parentId: "TECHNICAL",
    id: "OTHER",
    label: "J'ai un autre problème",
    tags: ["TAG_autre"],
  },
];
export const step2Question = [
  {
    parentId: "QUESTION",
    id: "PHASE_1",
    label: "Phase 1 - séjour de cohésion",
    tags: ["TAG_phase_1"],
  },
  {
    parentId: "QUESTION",
    id: "PHASE_2",
    label: "Phase 2 - Mission d'intérêt général",
    tags: ["TAG_phase_2"],
  },
  {
    parentId: "QUESTION",
    id: "PHASE_3",
    label: "Phase 3 - L'engagement",
    tags: ["TAG_phase_3"],
  },
  {
    parentId: "QUESTION",
    id: "OTHER",
    label: "Autre",
    tags: ["TAG_autre"],
  },
];

const Label = styled.div`
  color: #374151;
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 5px;
`;
