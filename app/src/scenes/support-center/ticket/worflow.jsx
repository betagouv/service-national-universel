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
    label: "Phase 1 - Mon séjour de cohésion",
    tags: ["TAG_phase_1"],
  },
  PHASE_1_WITHDRAWAL: {
    parentId: "QUESTION",
    id: "PHASE_1_WITHDRAWAL",
    label: "Phase 1 - Changer de séjour/se désister",
    tags: ["TAG_phase_1"],
  },
  PHASE_2: {
    parentId: "QUESTION",
    id: "PHASE_2",
    label: "Phase 2 - Comment trouver une Mission d'intérêt général ?",
    tags: ["TAG_phase_2"],
  },
  PHASE_2_MISSION: {
    parentId: "QUESTION",
    id: "PHASE_2_MISSION",
    label: "Phase 2 - J'ai trouvé une Mission d'intérêt général mais elle n'est pas sur la plateforme comment faire ?",
    tags: ["TAG_phase_2"],
  },
  PHASE_2_CANDIDATURE: {
    parentId: "QUESTION",
    id: "PHASE_2_CANDIDATURE",
    label: "Phase 2 - Je n'ai pas de nouvelle de ma candidature",
    tags: ["TAG_phase_2"],
  },
  PHASE_2_JDC: {
    parentId: "QUESTION",
    id: "PHASE_2_JDC",
    label: "Phase 2 - Ma JDC / Mon CIP",
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
    stepId: "PHASE_1_WITHDRAWAL",
  },
  {
    title: "Phase 1 : Se désister",
    emoji: "😕",
    body: "Vous n'êtes plus en mesure de participer au séjour ? Vous pouvez vous désister directement depuis votre espace.",
    url: `${supportURL}/base-de-connaissance/je-me-desiste-du-snu`,
    stepId: "PHASE_1_WITHDRAWAL",
  },
  {
    title: "Phase 2 : Comment trouver une MIG ?",
    emoji: "🤝",
    body: "Vous souhaitez des renseignements sur les MIG ?",
    url: `${supportURL}/base-de-connaissance/comment-trouver-une-mig`,
    stepId: "PHASE_2",
  },
  {
    title: "Phase 2 : Je ne trouve pas de mission qui m'intéresse",
    emoji: "😐",
    body: "Vous ne trouvez pas la MIG qui vous intéresse ?",
    url: `${supportURL}/base-de-connaissance/je-ne-trouve-pas-de-mission-qui-minteresse`,
    stepId: "PHASE_2_MISSION",
  },
  {
    title: "Phase 2 : Journée défense et citoyenneté (JDC, recensement, JDM)",
    emoji: "📣",
    body: "Tout connaître sur la JDC ?",
    url: `${supportURL}/base-de-connaissance/journee-defense-et-citoyennete`,
    stepId: "PHASE_2_JDC",
  },
  {
    title: "Phase 2 : Prise en charge du e-learning et de l'examen du code de la route",
    emoji: "🚗",
    body: "Vous vous demandez comment obtenir votre code de la route via le SNU ?",
    url: `${supportURL}/base-de-connaissance/permis-et-code-de-la-route`,
    stepId: "PHASE_2_LICENSE",
  },
  {
    title: "Phase 3 : Comment fonctionne la phase 3 ?",
    emoji: "🌟",
    body: "Vous souhaitez comprendre le déroulement de la phase 3 du SNU ?",
    url: `${supportURL}/base-de-connaissance/comment-fonctionne-la-phase-3`,
    stepId: "PHASE_3",
  },
];
