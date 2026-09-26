/**
 * GOO-16 — cookies de session limités à l'hôte de l'API.
 *
 * Posés sur le domaine parent (.snu.gouv.fr), `jwt_ref`, `jwt_young` et `trust_token-*` partaient vers tous les
 * sous-domaines. Ils sont désormais sans attribut Domain ; seul `jwtzamoud`, lu par snupport-api sur un autre hôte,
 * garde le domaine parent. Les cookies déjà posés sur le domaine parent sont expirés à chaque pose et effacement.
 */
import express from "express";
import request from "supertest";

import { config } from "../config";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { cookieOptions, sharedCookieOptions, setSessionCookie, clearSessionCookie } = require("../cookie-options");

const previous = config.ENVIRONMENT;
afterEach(() => {
  (config as any).ENVIRONMENT = previous;
});

function appWith(handler: (res: express.Response) => void) {
  const app = express();
  app.get("/", (_req, res) => {
    handler(res);
    res.send("ok");
  });
  return app;
}

function setCookies(res: request.Response): string[] {
  const header = res.headers["set-cookie"] as unknown as string[] | string | undefined;
  if (!header) return [];
  return Array.isArray(header) ? header : [header];
}

const isExpired = (cookie: string) => /Expires=Thu, 01 Jan 1970/.test(cookie);

describe.each([
  ["production", ".snu.gouv.fr"],
  ["staging", ".beta-snu.dev"],
  ["ci", ".beta-snu.dev"],
])("%s", (environment, parentDomain) => {
  beforeEach(() => {
    (config as any).ENVIRONMENT = environment;
  });

  it("cookieOptions n'a plus d'attribut Domain", () => {
    expect(cookieOptions(1000)).not.toHaveProperty("domain");
    expect(cookieOptions(1000)).toMatchObject({ sameSite: "Strict", httpOnly: true, secure: true });
  });

  it("sharedCookieOptions garde le domaine parent (jwtzamoud)", () => {
    expect(sharedCookieOptions(1000)).toMatchObject({ domain: parentDomain, httpOnly: true, secure: true });
  });

  it("setSessionCookie pose un cookie de l'hôte et expire l'ancien du domaine parent", async () => {
    const res = await request(appWith((r) => setSessionCookie(r, "jwt_ref", "jeton", 60_000))).get("/");
    const cookies = setCookies(res).filter((c) => c.startsWith("jwt_ref="));
    expect(cookies).toHaveLength(2);

    const hostOnly = cookies.find((c) => c.startsWith("jwt_ref=jeton"))!;
    expect(hostOnly).toBeDefined();
    expect(hostOnly).not.toMatch(/Domain=/i);
    expect(hostOnly).toMatch(/HttpOnly/);
    expect(isExpired(hostOnly)).toBe(false);

    const legacy = cookies.find((c) => c !== hostOnly)!;
    expect(legacy).toMatch(new RegExp(`Domain=${parentDomain.replace(/\./g, "\\.")}`, "i"));
    expect(isExpired(legacy)).toBe(true);
  });

  it("clearSessionCookie expire le cookie de l'hôte et celui du domaine parent", async () => {
    const res = await request(appWith((r) => clearSessionCookie(r, "jwt_young"))).get("/");
    const cookies = setCookies(res).filter((c) => c.startsWith("jwt_young="));
    expect(cookies).toHaveLength(2);
    expect(cookies.every(isExpired)).toBe(true);
    expect(cookies.filter((c) => /Domain=/i.test(c))).toHaveLength(1);
  });
});

describe("recette (custom) et développement", () => {
  it.each(["custom", "development"])("%s : un seul Set-Cookie, pas d'expiration d'un cookie parent", async (environment) => {
    (config as any).ENVIRONMENT = environment;
    const res = await request(appWith((r) => setSessionCookie(r, "jwt_ref", "jeton", 60_000))).get("/");
    expect(setCookies(res).filter((c) => c.startsWith("jwt_ref="))).toHaveLength(1);
  });
});
