const { readFile } = require("node:fs/promises");
const { resolve } = require("node:path");

const APPLICATIONS = ["app", "admin", "api", "apiv2", "tasks", "tasksv2"];

const FRONTEND_APPS = ["app", "admin"];

const SCW_REGISTRY_HOST = "rg.fr-par.scw.cloud";

function mountSecretKeys(app) {
  switch (app) {
    case "app":
    case "admin":
      return ["SENTRY_AUTH_TOKEN"];
    default:
      return ["PM2_SLACK_URL"];
  }
}

function _urlsFromDomain(domain) {
  return {
    admin: `https://admin.${domain}`,
    api: `https://api.${domain}`,
    apiv2: `https://apiv2.${domain}`,
    app: `https://moncompte.${domain}`,
  };
}

function getRegistryName(registry) {
  return registry.replace(`${SCW_REGISTRY_HOST}/`, "");
}

class EnvConfig {
  constructor(environment) {
    this.env = environment;
  }
  containerNamespace() {
    return `snu-${this.env}`;
  }

  dockerRegistry() {
    switch (this.env) {
      case "staging":
        return `${SCW_REGISTRY_HOST}/snu-staging`;
      case "production":
        return `${SCW_REGISTRY_HOST}/snu-production`;
      default:
        return `${SCW_REGISTRY_HOST}/snu-ci`;
    }
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

  applicationUrls(registryEndpoint) {
    let domain;
    switch (this.env) {
      case "staging":
        return _urlsFromDomain("beta-snu.dev");
      case "production":
        return _urlsFromDomain("snu.gouv.fr");
      case "ci":
        return _urlsFromDomain("ci.beta-snu.dev");
      case "development":
        domain = "localhost";
        return {
          admin: `http://${domain}:8082`,
          api: `http://${domain}:8080`,
          apiv2: `http://${domain}:8086`,
          app: `http://${domain}:8081`,
        };
      default: //custom_env
        const domain_prefix = registryEndpoint.replace(
          "rg.fr-par.scw.cloud/funcscw",
          ""
        );
        domain = "functions.fnc.fr-par.scw.cloud";

        return {
          admin: `https://${domain_prefix}-admin.${domain}`,
          api: `https://${domain_prefix}-api.${domain}`,
          apiv2: `https://${domain_prefix}-apiv2.${domain}`,
          app: `https://${domain_prefix}-app.${domain}`,
        };
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
    switch (this.app) {
      case "tasks":
        return "api";
      case "tasksv2":
        return "apiv2";
      default:
        return this.app;
    }
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

    const app = this.imageName();

    switch (this.env) {
      case "staging":
      case "production":
        return `${this.env}-${app}-run`;
      default:
        return `ci-${app}-run`;
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

    const urls = this.applicationUrls(registryEndpoint);

    switch (this.app) {
      case "app":
      case "admin":
        return {
          ...vars,
          VITE_APP_URL: urls.app,
          VITE_API_URL: urls.api,
          VITE_APIV2_URL: urls.apiv2,
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
        switch (this.app) {
          case "tasks":
          case "tasksv2":
            return { RUN_TASKS: "true" };
          default:
            return {};
        }
    }

    const urls = this.applicationUrls(registryEndpoint);

    switch (this.app) {
      case "api":
      case "apiv2":
        return {
          APP_URL: urls.app,
          API_URL: urls.api,
          APIV2_URL: urls.apiv2,
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
  getRegistryName,
};
