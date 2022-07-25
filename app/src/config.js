const environment = getEnvironment();

let apiURL = "http://localhost:8080";
let adminURL = "http://localhost:8082";
let appURL = "http://localhost:8081";
let supportURL = "http://localhost:8083";
let educonnectAllowed = true;
let maintenance = false;
let SENTRY_URL = "https://9e069a8cb7c44fdda06b017c3f40ed7d@sentry.selego.co/3";

if (environment === "staging") {
  apiURL = "https://app-a29a266c-556d-4f95-bc0e-9583a27f3f85.cleverapps.io";
  adminURL = "https://app-735c50af-69c1-4a10-ac30-7ba11d1112f7.cleverapps.io";
  appURL = "https://app-66aba4d6-e5fc-4c74-b252-f55fb0e9d37f.cleverapps.io";
  supportURL = "https://app-9266b532-ff6e-4a6a-aeeb-e6ff7bb67f60.cleverapps.io";
  SENTRY_URL = "https://9e069a8cb7c44fdda06b017c3f40ed7d@sentry.selego.co/3";
}
if (environment === "production") {
  apiURL = "https://api.snu.gouv.fr";
  adminURL = "https://admin.snu.gouv.fr";
  appURL = "https://moncompte.snu.gouv.fr";
  supportURL = "https://support.snu.gouv.fr";
  educonnectAllowed = false;
  SENTRY_URL = "https://7ea12aa0ec2142c8a7ff4d55146036bb@sentry.selego.co/4";
}

const S3PREFIX = "";

let franceConnectUrl = "https://fcp.integ01.dev-franceconnect.fr/api/v1";

if (environment === "production") {
  franceConnectUrl = "https://app.franceconnect.gouv.fr/api/v1";
}

function getEnvironment() {
  if (window.location.href.indexOf("localhost") !== -1 || window.location.href.indexOf("127.0.0.1") !== -1) return "development";
  if (window.location.href.indexOf("app-66aba4d6-e5fc-4c74-b252-f55fb0e9d37f.cleverapps.io") !== -1) return "staging";
  return "production";
}

export { apiURL, S3PREFIX, SENTRY_URL, environment, franceConnectUrl, adminURL, appURL, supportURL, educonnectAllowed, maintenance };
