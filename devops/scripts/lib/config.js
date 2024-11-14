const ENVS = ["ci", "staging", "production"];
const APPS = ["app", "admin", "api", "apiv2"];

const FRONTEND_APPS = ["app", "admin"];

function releaseKey(app) {
  switch (app) {
    case "app":
    case "admin":
      return "VITE_RELEASE";
    default:
      return "RELEASE";
  }
}

function mountSecretKeys(app) {
  switch (app) {
    case "app":
    case "admin":
      return ["SENTRY_AUTH_TOKEN"];
    default:
      return ["PM2_SLACK_URL"];
  }
}
class Config {
  constructor(environment, application) {
    if (!ENVS.includes(environment)) {
      throw new Error(`Unknown environment: ${environment}`);
    }
    if (!APPS.includes(application)) {
      throw new Error(`Unknown application: ${application}`);
    }
    this.env = environment;
    this.app = application;
  }

  containerName() {
    return `${this.env}-${this.app}`;
  }

  containerNamespace() {
    return `snu-${this.env}`;
  }

  projectName() {
    return `snu-${this.env}`;
  }

  runSecretName() {
    if (FRONTEND_APPS.includes(this.app)) {
      throw new Error("No runtime configuration for frontend applications");
    }
    return `${this.env}-${this.app}-run`;
  }

  buildSecretName() {
    return `${this.env}-${this.app}-build`;
  }

  registry() {
    return `rg.fr-par.scw.cloud/snu-${this.env}/${this.app}`;
  }

  releaseKey() {
    return releaseKey(this.app);
  }

  mountSecretKeys() {
    return mountSecretKeys(this.app);
  }
}

module.exports = {
  Config,
};
