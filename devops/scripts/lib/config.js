const { readFile } = require("node:fs/promises");
const { resolve } = require("node:path");

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

class EnvConfig {
  constructor(environment) {
    this.env = environment;
  }
  containerNamespace() {
    return `snu-${this.env}`;
  }

  projectName() {
    switch (this.env) {
      case "staging":
      case "production":
        return `snu-production`;
      default:
        return `snu-ci`;
    }
  }
}
class AppConfig extends EnvConfig {
  constructor(environment, application) {
    super(environment);
    if (!APPS.includes(application)) {
      throw new Error(`Unknown application: ${application}`);
    }
    this.app = application;
  }

  containerName() {
    return `${this.env}-${this.app}`;
  }

  async containerOptions() {
    let filename;
    switch (this.env) {
      case "staging":
      case "production":
      case "ci":
        filename = this.env;
        break;
      default:
        filename = "custom";
    }
    const filePath = resolve(
      `${__dirname}/../../config/${this.app}/${filename}.json`
    );
    const contents = await readFile(filePath, { encoding: "utf8" });
    return JSON.parse(contents);
  }

  runSecretName() {
    if (FRONTEND_APPS.includes(this.app)) {
      return "";
    }
    switch (this.env) {
      case "staging":
      case "production":
        return `${this.env}-${this.app}-run`;
      default:
        return `ci-${this.app}-run`;
    }
  }

  buildSecretName() {
    switch (this.env) {
      case "staging":
      case "production":
        return `${this.env}-${this.app}-build`;
      default:
        return `ci-${this.app}-build`;
    }
  }

  releaseKey() {
    return releaseKey(this.app);
  }

  mountSecretKeys() {
    return mountSecretKeys(this.app);
  }
}

module.exports = {
  EnvConfig,
  AppConfig,
};
