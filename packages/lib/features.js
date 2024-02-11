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
    // Allow developers mode in staging and development
  },
};

function isFeatureEnabled(featureName, userRole, environment) {
  const feature = features[featureName];
  environment = environment || getEnvFromDomain();
  if (!feature || !ENVS[environment]) {
    return false;
  }

  // If the environment is not defined then the feature is enabled
  // or if the environment is defined and the user has the role
  return !feature[environment] || feature[environment].includes(userRole);
}

function getEnvFromDomain() {
  if (!window) throw new Error("Cannot be called outside of the browser");

  const domain = window.location.hostname;
  if (domain.includes("snu.gouv.fr")) {
    return ENVS.production;
  }
  if (domain.includes("beta-snu.dev")) {
    return ENVS.staging;
  }
  return ENVS.development;
}

export { FEATURES_NAME, isFeatureEnabled };
