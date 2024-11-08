const ENVS = ["test", "development", "ci", "custom", "staging", "production"];

// List of features
const FEATURES_NAME = {
  SIDEBAR: "sidebar",
  DASHBOARD: "dashboard",
  FORCE_REDIRECT: "forceRedirect",
  EMAIL_VALIDATION: "emailValidation",
  DEVELOPERS_MODE: "developersMode",
  API_ENG_TRACKING: "apiEngagementTracking",
};

// If the environment is not defined then the feature is enabled
const features = {
  [FEATURES_NAME.FORCE_REDIRECT]: {
    production: [],
    staging: [],
    custom: [],
    ci: [],
  },
  [FEATURES_NAME.EMAIL_VALIDATION]: {
    // "staging": [],
    // "development": [],
  },
  [FEATURES_NAME.DEVELOPERS_MODE]: {
    production: [],
    // Allow developers mode in staging and development
  },
  [FEATURES_NAME.API_ENG_TRACKING]: {
    // production: [],
    staging: [],
    // custom: [],
    ci: [],
  },
};

function isFeatureEnabled(featureName, userRole, environment) {
  const feature = features[featureName];

  if (!feature || !ENVS.includes(environment)) {
    return false;
  }

  // If the environment is not defined then the feature is enabled
  // or if the environment is defined and the user has the role
  return !feature[environment] || feature[environment].includes(userRole);
}

export { FEATURES_NAME, isFeatureEnabled };
