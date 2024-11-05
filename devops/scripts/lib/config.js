const ENVS = new Set(["ci", "staging", "production"]);
const APPS = new Set(["app", "admin"]);

function getConfig(env, app) {
  if (!ENVS.has(env)) {
    throw new Error(`Unknown environment: ${env}`);
  }
  if (!APPS.has(app)) {
    throw new Error(`Unknown application: ${app}`);
  }

  return {
    projectName: `snu-${env}`,
    secretName: `${env}-${app}`,
    registry: `rg.fr-par.scw.cloud/snu-${env}/${app}`,
  };
}

module.exports = {
  getConfig,
};
