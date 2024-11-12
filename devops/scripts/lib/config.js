const ENVS = new Set(["ci", "staging", "production"]);
const APPS = new Set(["app", "admin", "api"]);

class Config {
  constructor(environment, application) {
    if (!ENVS.has(environment)) {
      throw new Error(`Unknown environment: ${environment}`);
    }
    if (!APPS.has(application)) {
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

  secretName() {
    return `${this.env}-${this.app}`;
  }

  registry() {
    return `rg.fr-par.scw.cloud/snu-${this.env}/${this.app}`;
  }
}

module.exports = {
  Config,
};
