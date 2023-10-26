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
  FORCE_REDIRECT: "forceRedirect",
  EMAIL_VALIDATION: "emailValidation",
  DEVELOPERS_MODE: "developersMode",
};

// If the environment is not defined then the feature is enabled
const features = {
  [FEATURES_NAME.SIDEBAR]: {
    [ENVS.production]: [ROLES.ADMIN, ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION, ROLES.RESPONSIBLE, ROLES.SUPERVISOR],
  },
  [FEATURES_NAME.DASHBOARD]: {
    [ENVS.production]: [ROLES.ADMIN, ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION, ROLES.RESPONSIBLE, ROLES.SUPERVISOR],
  },
  [FEATURES_NAME.FORCE_REDIRECT]: {
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
  [FEATURES_NAME.DEVELOPERS_MODE]: {
    [ENVS.production]: [],
    [ENVS.staging]: [ROLES.ADMIN],
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
