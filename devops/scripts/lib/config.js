function getConfig(env) {
  switch (env) {
    case "ci":
      return {
        projectName: "snu-ci",
        secretName: "ci-moncompte",
        registry: "rg.fr-par.scw.cloud/snu-ci",
      };
    case "staging":
      return {
        projectName: "snu-production",
        secretName: "staging-moncompte",
        registry: "rg.fr-par.scw.cloud/snu-staging",
      };
    case "production":
      return {
        projectName: "snu-production",
        secretName: "production-moncompte",
        registry: "rg.fr-par.scw.cloud/snu-production",
      };
    default:
      throw new Error(`Unknown environment: ${env}`);
  }
}

module.exports = {
  getConfig,
};
