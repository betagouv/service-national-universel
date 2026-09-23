/**
 * GOO-7 — autorité de la base de connaissance publique (support.snu.gouv.fr) sur les sessions.
 *
 *   FH16 — passport.getToken acceptait jwt_ref/jwt_young depuis l'origine de la KB, qui a les
 *          credentials CORS : une XSS sur la KB agissait sur toute l'API v1 avec la session du lecteur.
 *   FL9  — GET /signin/token renvoyait le profil complet (santé, représentants légaux d'un jeune),
 *          persisté ensuite en sessionStorage par le cache SWR de la KB.
 */
import request from "supertest";
import jwt from "jsonwebtoken";
import { Request } from "express";

import getAppHelper, { resetAppAuth } from "./helpers/app";
import { dbConnect, dbClose, clearDatabase } from "./helpers/db";
import getNewYoungFixture from "./fixtures/young";
import getNewReferentFixture from "./fixtures/referent";
import { createYoungHelper } from "./helpers/young";
import { createReferentHelper } from "./helpers/referent";
import { ReferentModel } from "../models";
import { config } from "../config";
import { getToken } from "../passport";
import { JWT_SIGNIN_VERSION, JWT_SIGNIN_MAX_AGE_SEC } from "../jwt-options";

beforeAll(async () => {
  await dbConnect(__filename.slice(__dirname.length + 1, -3));
});

afterAll(async () => {
  await dbClose();
});

afterEach(async () => {
  resetAppAuth();
  await clearDatabase();
});

const signSession = (account: { _id: any; passwordChangedAt?: Date | null; lastLogoutAt?: Date | null }) =>
  jwt.sign(
    { __v: JWT_SIGNIN_VERSION, _id: account._id.toString(), passwordChangedAt: account.passwordChangedAt ?? null, lastLogoutAt: account.lastLogoutAt ?? null },
    config.JWT_SECRET,
    { expiresIn: JWT_SIGNIN_MAX_AGE_SEC },
  );

const fakeRequest = (origin: string, cookies: Record<string, string>) =>
  ({ headers: {}, cookies, get: (name: string) => (name === "Origin" ? origin : undefined) }) as unknown as Request;

describe("FH16 — passport.getToken", () => {
  it("ignore les cookies de session quand l'origine est la base de connaissance", () => {
    expect(getToken(fakeRequest(config.KNOWLEDGEBASE_URL, { jwt_ref: "ref", jwt_young: "young" }))).toBeFalsy();
  });

  it("lit toujours le cookie depuis l'admin et depuis l'app volontaire", () => {
    expect(getToken(fakeRequest(config.ADMIN_URL, { jwt_ref: "ref" }))).toBe("ref");
    expect(getToken(fakeRequest(config.APP_URL, { jwt_young: "young" }))).toBe("young");
  });
});

describe("GET /signin/token depuis la base de connaissance", () => {
  it("renvoie le rôle et les initiales d'un référent, sans le profil", async () => {
    const referent = await createReferentHelper({ ...getNewReferentFixture(), role: "referent_department", firstName: "jeanne", lastName: "martin" } as any);

    const res = await request(getAppHelper())
      .get("/signin/token")
      .set("Origin", config.KNOWLEDGEBASE_URL)
      .set("Cookie", `jwt_ref=${signSession(referent)}`);

    expect(res.status).toBe(200);
    expect(res.body.user).toEqual({ role: "referent_department", initials: "JM", allowedRole: "referent" });
  });

  it("ne renvoie ni santé, ni représentants légaux, ni coordonnées d'un volontaire", async () => {
    const young = await createYoungHelper({ ...getNewYoungFixture(), source: "CLE" } as any);

    const res = await request(getAppHelper())
      .get("/signin/token")
      .set("Origin", config.KNOWLEDGEBASE_URL)
      .set("Cookie", `jwt_young=${signSession(young)}`);

    expect(res.status).toBe(200);
    expect(Object.keys(res.body.user).sort()).toEqual(expect.arrayContaining(["allowedRole", "initials", "source"]));
    expect(Object.keys(res.body.user).every((key) => ["role", "subRole", "source", "initials", "allowedRole"].includes(key))).toBe(true);
    expect(res.body.user.allowedRole).toBe("young");
    expect(res.body.user.source).toBe("CLE");
    expect(res.body.user.email).toBeUndefined();
  });

  it("ignore le cookie quand l'origine n'est ni la KB ni un front de l'API", async () => {
    const referent = await createReferentHelper(getNewReferentFixture() as any);

    const res = await request(getAppHelper())
      .get("/signin/token")
      .set("Origin", "https://evil.example")
      .set("Cookie", `jwt_ref=${signSession(referent)}`);

    expect(res.status).toBe(401);
  });
});

describe("POST /signin/logout depuis la base de connaissance", () => {
  it("clôt la session du référent et efface son cookie", async () => {
    const referent = await createReferentHelper(getNewReferentFixture() as any);

    const res = await request(getAppHelper())
      .post("/signin/logout")
      .set("Origin", config.KNOWLEDGEBASE_URL)
      .set("Cookie", `jwt_ref=${signSession(referent)}`);

    expect(res.status).toBe(200);
    expect(String(res.headers["set-cookie"])).toMatch(/jwt_ref=;/);
    const after = await ReferentModel.findById(referent._id);
    expect(after!.lastLogoutAt).toBeTruthy();
  });

  it("refuse sans session", async () => {
    const res = await request(getAppHelper()).post("/signin/logout").set("Origin", config.KNOWLEDGEBASE_URL);
    expect(res.status).toBe(401);
  });
});
