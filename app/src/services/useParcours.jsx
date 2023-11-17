import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useHistory } from "react-router-dom";
import parcoursConfig from "../utils/parcoursConfig";
import { YOUNG_SOURCE } from "snu-lib";
import { setYoung } from "../redux/auth/actions";
import { toastr } from "react-redux-toastr";

export const useParcours = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const { pathname } = useLocation();
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
        replacedStepConfig[key] = replacePlaceholders(replacedStepConfig[key], { firstName: young.firstName, email: young.email });
      }
    });

    return replacedStepConfig;
  };

  const stepDoneBeforeinscriptionConfig = getStepConfig(young.source, "stepDone");

  return {
    stepDoneBeforeinscriptionConfig,
  };
};

export default useParcours;
