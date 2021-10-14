import React from "react";
import { Col } from "reactstrap";
import styled from "styled-components";
import { Field } from "formik";

export const SelectTag = ({ options, name, value, title, selectPlaceholder, handleChange }) => {
  return (
    <Col style={{ marginTop: 20 }}>
      <Label>{title}</Label>
      <Field
        as="select"
        className="form-control"
        name={name}
        value={value || ""}
        onChange={(e) => {
          const value = options.find((o) => o.id === e.target.value);
          handleChange({ target: { name, value } });
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

export const typesReferent = {
  TECHNICAL: {
    id: "TECHNICAL",
    label: "J'ai un problème technique",
    tags: ["TAG_problème_technique", "AGENT_Startup_Support", "AGENT_Startup_Technique"],
  },
  SPECIAL_CASE: {
    id: "SPECIAL_CASE",
    label: "J'ai un cas particulier (volontaire)",
    tags: ["TAG_Cas_particulier", "AGENT_Startup_Support"],
  },
  OTHER: {
    id: "OTHER",
    label: "Autre",
    tags: ["TAG_Autre Demande", "AGENT_Startup_Support"],
  },
};

export const subjectsReferent = {
  DOWNLOAD: {
    parentId: "TECHNICAL",
    id: "DOWNLOAD",
    label: "Je n'arrive pas à télécharger un document depuis la plateforme",
    tags: ["TAG_téléchargment"],
  },
  UPLOAD: {
    parentId: "TECHNICAL",
    id: "UPLOAD",
    label: "Je n'arrive pas à téléverser (déposer) un document",
    tags: ["TAG_téléversement"],
  },
  CONTRACT: {
    parentId: "TECHNICAL",
    id: "CONTRACT",
    label: "Je n'ai pas reçu le lien de validation du contrat d'engagement",
    tags: ["TAG_contrat_engagement"],
  },
  OTHER: {
    parentId: "TECHNICAL",
    id: "OTHER",
    label: "J'ai un autre problème",
    tags: ["TAG_autre"],
  },
  PHASE_1: {
    parentId: "SPECIAL_CASE",
    id: "PHASE_1",
    label: "Phase 1 - séjour de cohésion",
    tags: ["TAG_phase_1"],
  },
  PHASE_2: {
    parentId: "SPECIAL_CASE",
    id: "PHASE_2",
    label: "Phase 2 - Mission d'intérêt général",
    tags: ["TAG_phase_2"],
  },
  PHASE_3: {
    parentId: "SPECIAL_CASE",
    id: "PHASE_3",
    label: "Phase 3 - L'engagement",
    tags: ["TAG_phase_3"],
  },
  OTHER: {
    parentId: "SPECIAL_CASE",
    id: "OTHER",
    label: "Autre",
    tags: ["TAG_autre"],
  },
};

export const typesAdmin = {
  TECHNICAL: {
    id: "TECHNICAL",
    label: "J'ai un problème technique",
    tags: ["TAG_problème_technique", "AGENT_Startup_Support", "AGENT_Startup_Technique"],
  },
  OTHER: {
    id: "OTHER",
    label: "Autre",
    tags: ["TAG_Autre Demande", "AGENT_Startup_Support"],
  },
};

export const subjectsAdmin = {
  DOWNLOAD: {
    parentId: "TECHNICAL",
    id: "DOWNLOAD",
    label: "Je n'arrive pas à télécharger un document depuis la plateforme",
    tags: ["TAG_téléchargment"],
  },
  UPLOAD: {
    parentId: "TECHNICAL",
    id: "UPLOAD",
    label: "Je n'arrive pas à téléverser (déposer) un document",
    tags: ["TAG_téléversement"],
  },
  OTHER: {
    parentId: "TECHNICAL",
    id: "OTHER",
    label: "J'ai un autre problème",
    tags: ["TAG_autre"],
  },
};

export const typesStructure = {
  TECHNICAL: {
    id: "TECHNICAL",
    label: "J'ai un problème technique",
    tags: ["TAG_problème_technique", "AGENT_Startup_Support", "AGENT_Startup_Technique"],
  },
  QUESTION: {
    id: "QUESTION",
    label: "J'ai une question",
    tags: ["TAG_Question", "AGENT_Startup_Support"],
  },
  OTHER: {
    id: "OTHER",
    label: "Autre",
    tags: ["TAG_Autre Demande", "AGENT_Startup_Support"],
  },
};

export const subjectsStructure = {
  DOWNLOAD: {
    parentId: "TECHNICAL",
    id: "DOWNLOAD",
    label: "Je n'arrive pas à télécharger un document depuis la plateforme",
    tags: ["TAG_téléchargment"],
  },
  UPLOAD: {
    parentId: "TECHNICAL",
    id: "UPLOAD",
    label: "Je n'arrive pas à téléverser (déposer) un document",
    tags: ["TAG_téléversement"],
  },
  CONTRACT: {
    parentId: "TECHNICAL",
    id: "CONTRACT",
    label: "Je n'ai pas reçu le lien de validation du contrat d'engagement",
    tags: ["TAG_contrat_engagement"],
  },
  OTHER: {
    parentId: "TECHNICAL",
    id: "OTHER",
    label: "J'ai un autre problème",
    tags: ["TAG_autre"],
  },
  MISSION: {
    parentId: "QUESTION",
    id: "MISSION",
    label: "Ma mission",
    tags: ["TAG_Fiche mission"],
  },
  QUESTION_CONTRACT: {
    parentId: "QUESTION",
    id: "QUESTION_CONTRACT",
    label: "Le contrat d'engagement",
    tags: ["TAG_contrat_engagement"],
  },
  ACCUEIL: {
    parentId: "QUESTION",
    id: "ACCUEIL",
    label: "L'accueil du/de la volontaire",
    tags: ["TAG_Accueil"],
  },
  APPLICATION: {
    parentId: "QUESTION",
    id: "APPLICATION",
    label: "La candidature d'un volontaire",
    tags: ["TAG_Candidature"],
  },
  QUESTION_OTHER: {
    parentId: "QUESTION",
    id: "QUESTION_OTHER",
    label: "Autre",
    tags: ["TAG_autre"],
  },
};

const Label = styled.div`
  color: #374151;
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 5px;
`;
