import React from "react";
import { Col } from "reactstrap";
import styled from "styled-components";
import { Field } from "formik";
import ErrorMessage, { requiredMessage } from "../../inscription2023/components/ErrorMessageOld";
import { supportURL } from "../../../config";
import plausibleEvent from "../../../services/plausible";

export const SelectTag = ({ options, name, value, title, selectPlaceholder, handleChange, errors, touched }) => {
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
          if (e.target.value === "PHASE_1_WITHDRAWAL") {
            plausibleEvent("Besoin d'aide - Desistement/Changement de sejour");
          }
          handleChange({ target: { name, value } });
        }}
        validate={(v) => !v && requiredMessage}>
        <option value="" disabled>
          {selectPlaceholder}
        </option>
        {options?.map((option, i) => (
          <option value={option.id} label={option.label} key={i}>
            {option.label}
          </option>
        ))}
      </Field>
      {errors && <ErrorMessage errors={errors} touched={touched} name={name} />}
    </Col>
  );
};

export const step0 = {
  VOLONTAIRE: {
    id: "volontaire",
    label: "Un(e) volontaire",
    tags: ["TAG_volontaire"],
  },
  REPRESENTANT: {
    id: "représentant légal",
    label: "Un(e) représentant(e) légal(e)",
    tags: ["TAG_représentant_legal"],
  },
};

export const step1 = {
  TECHNICAL: {
    id: "TECHNICAL",
    label: "J'ai un problème technique",
    tags: ["TAG_problème_technique", "AGENT_Startup_Support", "AGENT_Startup_Technique"],
  },
  QUESTION: {
    id: "QUESTION",
    label: "J'ai une question",
    tags: ["TAG_question", "AGENT_Startup_Support", "AGENT_Référent_Département", "AGENT_Référent_Région"],
  },
};

export const step2Technical = {
  CONNECTION: {
    parentId: "TECHNICAL",
    id: "CONNECTION",
    label: "Pour me connecter",
    tags: ["TAG_probleme_connexion"],
  },
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
};
export const step2Question = {
  PHASE_1: {
    parentId: "QUESTION",
    id: "PHASE_1",
    label: "Phase 1 - Pendant mon séjour de cohésion",
    tags: ["TAG_phase_1"],
  },
  PHASE_1_WITHDRAWAL: {
    parentId: "QUESTION",
    id: "PHASE_1_WITHDRAWAL",
    label: "Phase 1 - Changer de séjour/se désister",
    tags: ["TAG_phase_1"],
  },
  PHASE_1_DEPARTURE: {
    parentId: "QUESTION",
    id: "PHASE_1",
    label: "Phase 1 - Mon départ en séjour",
    tags: ["TAG_phase_1"],
  },
  PHASE_1_RETURN: {
    parentId: "QUESTION",
    id: "PHASE_1",
    label: "Phase 1 - Mon retour de séjour",
    tags: ["TAG_phase_1"],
  },
  PHASE_1_PDR_CHANGE: {
    parentId: "QUESTION",
    id: "PHASE_1",
    label: "Phase 1 - Changer de point de rassemblement",
    tags: ["TAG_phase_1"],
  },
  PHASE_2: {
    parentId: "QUESTION",
    id: "PHASE_2",
    label: "Phase 2 - Mission d'intérêt général",
    tags: ["TAG_phase_2"],
  },
  PHASE_2_LICENSE: {
    parentId: "QUESTION",
    id: "PHASE_2_LICENSE",
    label: "Phase 2 - Permis",
    tags: ["TAG_phase_2, TAG_phase_2_license"],
  },
  PHASE_3: {
    parentId: "QUESTION",
    id: "PHASE_3",
    label: "Phase 3 - L'engagement",
    tags: ["TAG_phase_3"],
  },
};

const Label = styled.div`
  color: #374151;
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 5px;
`;

export const articles = [
  {
    title: "Phase 1 : Changer les dates de mon séjour",
    emoji: "🌲",
    body: "Vous n'êtes plus disponible pendant votre séjour ? Découvrer comment transférer votre inscription sur un autre séjour du SNU.",
    url: `${supportURL}/base-de-connaissance/je-souhaite-changer-les-dates-de-mon-sejour`,
  },
  {
    title: "Phase 1 : Se désister",
    emoji: "😕",
    body: "Vous n'êtes plus en mesure de participer au séjour ? Vous pouvez vous désister directement depuis votre espace.",
    url: `${supportURL}/base-de-connaissance/je-me-desiste-du-snu`,
  },
];
