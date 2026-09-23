import { buildRequestPath, buildRequestQueryString, isInternalRedirectUrl, isValidRedirectUrl } from "./request";

describe("buildRequestPath", () => {
  it("should return the path with no params", () => {
    const path = "/users";
    const params = {};
    expect(buildRequestPath(path, params)).toEqual(path);
  });

  it("should return the path with params", () => {
    const path = "/users/{userId}";
    const params = { userId: "123" };
    expect(buildRequestPath(path, params)).toEqual("/users/123");
  });

  it("should return the path with optional params", () => {
    const path = "/users/{userId?}";
    const params = { userId: "123" };
    expect(buildRequestPath(path, params)).toEqual("/users/123");
  });

  it("should return the path with missing optional params", () => {
    const path = "/users/{userId?}";
    const params = {};
    expect(buildRequestPath(path, params)).toEqual("/users");
  });

  it("should return the path with missing required params", () => {
    const path = "/users/{userId}";
    const params = {}; // not handle
    expect(buildRequestPath(path, params)).toEqual("/users/{userId}");
  });
});

describe("buildRequestQueryString", () => {
  it("should return an empty string with no query", () => {
    expect(buildRequestQueryString()).toEqual("");
  });

  it("should return an empty string with an empty query", () => {
    expect(buildRequestQueryString({})).toEqual("");
  });

  it("should return a query string with a single query param", () => {
    const query = { page: 1 };
    expect(buildRequestQueryString(query)).toEqual("?page=1");
  });

  it("should return a query string with multiple query params", () => {
    const query = { page: 1, limit: 10 };
    expect(buildRequestQueryString(query)).toEqual("?limit=10&page=1");
  });
});

describe("isValidRedirectUrl", () => {
  it.each([
    "/",
    "/volontaire/123/phase1?tab=infos#top",
    "/besoin-d-aide?date=2026-09-23T10:00:00",
    "besoin-d-aide",
    "phase1",
    "https://snu.gouv.fr",
    "https://admin.snu.gouv.fr/volontaire",
    "https://support.snu.gouv.fr/base-de-connaissance/mon-article",
    "https://moncompte.beta-snu.dev/phase1",
    "HTTPS://ADMIN.SNU.GOUV.FR/",
  ])("accepte %s", (url) => {
    expect(isValidRedirectUrl(url)).toBe(true);
  });

  it.each([
    undefined,
    null,
    "",
    ["/"],
    // schémas non http
    "javascript:alert(document.domain)",
    "JavaScript:alert(1)",
    " javascript:alert(1)",
    "java\tscript:alert(1)",
    "java\nscript:alert(1)",
    "data:text/html,<script>alert(1)</script>",
    "vbscript:msgbox(1)",
    // hôte absolu sans schéma
    "//evil.tld",
    "///evil.tld",
    "/\\evil.tld",
    "\\\\evil.tld",
    "/\t/evil.tld",
    // schéma sans « // »
    "http:evil.tld",
    "https:evil.tld",
    "https:/evil.tld",
    // http en clair, port, identifiants
    "http://admin.snu.gouv.fr",
    "https://admin.snu.gouv.fr:8443/",
    "https://snu.gouv.fr@evil.tld",
    "https://user:pass@admin.snu.gouv.fr/",
    // domaines imités
    "https://snu.gouv.fr.evil.tld",
    "https://evilsnu.gouv.fr",
    "https://admin.snu.gouv.fr.evil.tld/",
    "https://evil.tld/snu.gouv.fr",
    "https://evil.tld?https://snu.gouv.fr",
    "https://beta-snu.dev.evil.tld",
  ])("refuse %p", (url) => {
    expect(isValidRedirectUrl(url)).toBe(false);
  });
});

describe("isInternalRedirectUrl", () => {
  it.each(["/", "/volontaire/123", "besoin-d-aide"])("%s reste sur le site", (url) => {
    expect(isInternalRedirectUrl(url)).toBe(true);
  });

  it.each([undefined, "", "https://admin.snu.gouv.fr/", "//evil.tld", "/\\evil.tld", "javascript:alert(1)", "https:evil.tld"])("%p ne reste pas sur le site", (url) => {
    expect(isInternalRedirectUrl(url)).toBe(false);
  });
});
