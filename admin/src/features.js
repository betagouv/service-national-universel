import { ROLES } from "snu-lib";
import { environment } from "./config";

const ENVS = {
  development: "development",
  staging: "staging",
  production: "production",
};

// List of features
const FEATURES_NAME = {
  // TODO: to remove when deployed
  SIDEBAR: "sidebar",
  // TODO: to remove when deployed
  DASHBOARD: "dashboard",
};

// If the environment is not defined then the feature is enabled
const features = {
  [FEATURES_NAME.SIDEBAR]: {
    [ENVS.production]: [ROLES.ADMIN],
  },
  [FEATURES_NAME.DASHBOARD]: {
    [ENVS.production]: [ROLES.ADMIN],
  },
};

function isFeatureEnabled(featureName, userRole) {
  const feature = features[featureName];
  if (!feature || !ENVS[environment]) {
    return false;
  }

  // If the environment is not defined then the feature is enabled
  // or if the environment is defined and the user has the role
  return !feature[environment] || feature[environment].includes(userRole);
}

export { FEATURES_NAME, isFeatureEnabled };
