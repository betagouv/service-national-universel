const { readFile } = require("node:fs/promises");
const { resolve } = require("node:path");

const APPLICATIONS = ["app", "admin", "api", "apiv2"];

const FRONTEND_APPS = ["app", "admin"];

function mountSecretKeys(app) {
  switch (app) {
    case "app":
    case "admin":
      return ["SENTRY_AUTH_TOKEN"];
    default:
      return ["PM2_SLACK_URL"];
  }
}

function applicationUrls(registryEndpoint) {
  const domain_prefix = registryEndpoint.replace(
    "rg.fr-par.scw.cloud/funcscw",
    ""
  );

  return {
    admin: `https://${domain_prefix}-admin.functions.fnc.fr-par.scw.cloud`,
    api: `https://${domain_prefix}-api.functions.fnc.fr-par.scw.cloud`,
    apiv2: `https://${domain_prefix}-apiv2.functions.fnc.fr-par.scw.cloud`,
    app: `https://${domain_prefix}-app.functions.fnc.fr-par.scw.cloud`,
  };
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
    if (!APPLICATIONS.includes(application)) {
      throw new Error(`Unknown application: ${application}`);
    }
    this.app = application;
  }

  containerName() {
    switch (this.env) {
      case "staging":
      case "production":
      case "ci":
        return `${this.env}-${this.app}`;
      default:
        return this.app;
    }
  }

  imageName() {
    return this.app;
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

  mountSecretKeys() {
    return mountSecretKeys(this.app);
  }

  buildEnvVariables(registryEndpoint, release) {
    const vars = {
      RELEASE: release,
      ENVIRONMENT: this.env,
    };
    switch (this.env) {
      case "staging":
      case "production":
      case "ci":
      case "development":
        return vars;
    }

    const urls = applicationUrls(registryEndpoint);

    switch (this.app) {
      case "app":
      case "admin":
        return {
          ...vars,
          VITE_APP_URL: urls.app,
          VITE_API_URL: urls.api,
          VITE_ADMIN_URL: urls.admin,
          NGINX_HOSTNAME: urls[this.app].replace("https://", ""),
        };
      default:
        return vars;
    }
  }

  runEnvVariables(registryEndpoint) {
    switch (this.env) {
      case "staging":
      case "production":
      case "ci":
        return {};
    }

    const urls = applicationUrls(registryEndpoint);

    switch (this.app) {
      case "api":
        return {
          APP_URL: urls.app,
          API_URL: urls.api,
          ADMIN_URL: urls.admin,
        };
      default:
        return {};
    }
  }
}

module.exports = {
  EnvConfig,
  AppConfig,
  APPLICATIONS,
};
