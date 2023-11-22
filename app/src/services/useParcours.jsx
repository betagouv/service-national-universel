import React from "react";
import ReactMarkdown from "react-markdown";
import gfm from "remark-gfm";
import { useSelector } from "react-redux";
import parcoursConfig from "../utils/parcoursConfig";
import { YOUNG_SOURCE } from "snu-lib";

export const useParcours = () => {
  const young = useSelector((state) => state.Auth.young);

  const replacePlaceholders = (text, placeholders) => {
    return Object.entries(placeholders).reduce((acc, [key, value]) => {
      return acc.replace(new RegExp(`{${key}}`, "g"), value);
    }, text);
  };

  const getStepConfig = (source, stepName) => {
    const sourceConfig = parcoursConfig[source] || parcoursConfig[YOUNG_SOURCE.VOLONTAIRE];
    const stepConfig = sourceConfig[stepName];
    if (!stepConfig) return null;

    // Remplacer les placeholders dans les textes de la configuration de l'étape
    const replacedStepConfig = { ...stepConfig };
    Object.keys(replacedStepConfig).forEach((key) => {
      if (typeof replacedStepConfig[key] === "string") {
        const textWithPlaceholders = replacePlaceholders(replacedStepConfig[key], { firstName: young.firstName, email: young.email });

        // Utiliser ReactMarkdown pour transformer le Markdown en éléments React
        replacedStepConfig[key] = <ReactMarkdown remarkPlugins={[gfm]}>{textWithPlaceholders}</ReactMarkdown>;
      }
    });

    return replacedStepConfig;
  };

  const stepPreinscriptionDoneConfig = getStepConfig(young.source, "stepPreinscriptionDone");
  const stepCoordonneesConfig = getStepConfig(young.source, "stepCoordonnees");
  const stepRepresentantsConfig = getStepConfig(young.source, "stepRepresentants");

  return {
    stepPreinscriptionDoneConfig,
    stepCoordonneesConfig,
    stepRepresentantsConfig,
  };
};

export default useParcours;
