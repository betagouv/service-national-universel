const environment = process.env.NEXT_PUBLIC_ENVIRONMENT;

let snuApiUrl = "http://localhost:8080";
let supportApiUrl = "http://localhost:3000";
let adminURL = "http://localhost:8082";
let appURL = "http://localhost:8081";

let supportURL = "http://localhost:8083";
let baseDeConnaissanceURL = "http://localhost:8084";

if (environment === "staging") {
  snuApiUrl = "https://api.beta-snu.dev";
  supportApiUrl = "https://api-support.beta-snu.dev";
  adminURL = "https://admin.beta-snu.dev";
  appURL = "https://moncompte.beta-snu.dev";
}
if (environment === "production") {
  snuApiUrl = "https://api.snu.gouv.fr";
  supportApiUrl = "https://api-support.snu.gouv.fr";
  adminURL = "https://admin.snu.gouv.fr";
  appURL = "https://moncompte.snu.gouv.fr";
  supportURL = "https://admin-support.snu.gouv.fr";
  baseDeConnaissanceURL = "https://support.snu.gouv.fr";
}

export { snuApiUrl, supportApiUrl, environment, adminURL, appURL, supportURL, baseDeConnaissanceURL };
