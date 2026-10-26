// FH16 : la base de connaissance publique est une origine CORS avec credentials. Une XSS sur
// support.snu.gouv.fr ne doit pas pouvoir agir avec le cookie de session d'un agent qui la lit.
jest.mock("../config", () => ({
  config: {
    SNUPPORT_URL_KB: "https://support.snu.gouv.fr",
    KNOWLEDGE_BASE_PUBLIC_URL: "http://localhost:8084",
    SNUPPORT_URL_ADMIN: "https://admin-support.snu.gouv.fr",
  },
}));
jest.mock("../models/organisation", () => ({}));
jest.mock("../models/agent", () => ({}));
jest.mock("../jwt-options", () => ({ checkJwtVersion: () => true }));
jest.mock("../sentry", () => ({ capture: jest.fn() }));

const { getToken } = require("../passport");

const buildRequest = ({ origin, cookie, authorization } = {}) => ({
  headers: authorization ? { authorization } : {},
  cookies: cookie ? { jwtzamoud: cookie } : {},
  get: (name) => (name === "Origin" ? origin : undefined),
});

describe("getToken de snupport-api : origine de la base de connaissance", () => {
  it("lit le cookie agent depuis l'interface du support", () => {
    expect(getToken(buildRequest({ origin: "https://admin-support.snu.gouv.fr", cookie: "jeton" }))).toBe("jeton");
  });

  it.each(["https://support.snu.gouv.fr", "http://localhost:8084"])("ignore le cookie agent quand l'origine est la base de connaissance (%s)", (origin) => {
    expect(getToken(buildRequest({ origin, cookie: "jeton" }))).toBeFalsy();
  });

  it("garde l'en-tête Authorization explicite, qui suppose de détenir le jeton", () => {
    expect(getToken(buildRequest({ origin: "https://support.snu.gouv.fr", authorization: "jwtzamoud entete" }))).toBe("entete");
  });

  // FM19 (audit des fronts du 23/09/2026) : une XSS dans l'admin SNU ou moncompte ne doit pas agir
  // avec la session d'un agent support qui les consulte.
  it.each(["https://admin.snu.gouv.fr", "https://moncompte.snu.gouv.fr", "https://autre.snu.gouv.fr", "null"])(
    "ignore le cookie agent quand l'origine n'est pas l'interface du support (%s)",
    (origin) => {
      expect(getToken(buildRequest({ origin, cookie: "jeton" }))).toBeFalsy();
    }
  );

  it("lit le cookie agent sans origine (navigation de premier niveau)", () => {
    expect(getToken(buildRequest({ cookie: "jeton" }))).toBe("jeton");
  });
});
