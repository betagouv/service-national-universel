import { ROLES } from "snu-lib";

const ENVS = {
  development: "development",
  staging: "staging",
  production: "production",
};

// List of features
const FEATURES_NAME = {
  SIDEBAR: "sidebar",
  DASHBOARD: "dashboard",
  FLEXIBLE_REDIRECT: "flexibleRedirect",
  EMAIL_VALIDATION: "emailValidation",
};

// If the environment is not defined then the feature is enabled
const features = {
  [FEATURES_NAME.FLEXIBLE_REDIRECT]: {
    [ENVS.production]: [],
    [ENVS.staging]: [],
  },
  [FEATURES_NAME.EMAIL_VALIDATION]: {
    // [ENVS.staging]: [],
    // [ENVS.development]: [],
  },
  [FEATURES_NAME.YOUNG_INSCRIPTION]: {
    [ENVS.production]: [],
  },
};

//Force redeploy

function isFeatureEnabled(featureName, userRole, environment) {
  const feature = features[featureName];
  if (!feature || !ENVS[environment]) {
    return false;
  }

  // If the environment is not defined then the feature is enabled
  // or if the environment is defined and the user has the role
  return !feature[environment] || feature[environment].includes(userRole);
}

export { FEATURES_NAME, isFeatureEnabled };
