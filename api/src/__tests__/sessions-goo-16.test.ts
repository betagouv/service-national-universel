/**
 * GOO-16 (audit des fronts du 23/09/2026) — non-régression côté api.
 *
 * FM2  : signin et signin-2fa acceptaient un formulaire urlencoded cross-site (login CSRF).
 * FM16 : les routes de session renvoyaient le JWT au JavaScript, que l'admin persistait en localStorage.
 * FM17 : jeton d'invitation référent — email révélé par signup_verify, activation d'un compte
 *        désactivé, renouvellement qui prolongeait le même jeton.
 */
import request from "supertest";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { ROLES, ReferentStatus } from "snu-lib";

import getAppHelper, { getAppHelperWithAcl, resetAppAuth } from "./helpers/app";
import { dbConnect, dbClose } from "./helpers/db";
import { ReferentModel } from "../models";
import { getNewReferentFixture } from "./fixtures/referent";
import { config } from "../config";
import { JWT_SIGNIN_VERSION } from "../jwt-options";

const mockSendTemplate = jest.fn((..._args: any[]) => Promise.resolve());
jest.mock("../brevo", () => ({
  ...jest.requireActual("../brevo"),
  sendEmail: () => Promise.resolve(),
  sendTemplate: (...args: any[]) => mockSendTemplate(...args),
}));

const SEPT_JOURS_MS = 7 * 24 * 3600 * 1000;
const MOT_DE_PASSE_VALIDE = "Toto1234!@#$";

function invitationEnCours() {
  return { invitationToken: crypto.randomBytes(20).toString("hex"), invitationExpires: new Date(Date.now() + SEPT_JOURS_MS) };
}

beforeAll(async () => {
  await dbConnect(__filename.slice(__dirname.length + 1, -3));
});
afterAll(async () => {
  await dbClose();
});
afterEach(() => {
  resetAppAuth();
  mockSendTemplate.mockClear();
});

describe("FM2 — les routes de connexion n'acceptent que du JSON", () => {
  it.each(["/referent/signin", "/referent/signin-2fa", "/young/signin", "/young/signin-2fa"])("refuse un formulaire urlencoded sur %s", async (route) => {
    const res = await request(getAppHelper()).post(route).type("form").send({ email: "victime@example.org", password: "x", token_2fa: "1", rememberMe: "true" });

    expect(res.status).toBe(415);
    expect(res.headers["set-cookie"]).toBeUndefined();
  });

  it("refuse un corps text/plain, l'autre type qu'un formulaire peut poster sans preflight", async () => {
    const res = await request(getAppHelper())
      .post("/referent/signin")
      .set("Content-Type", "text/plain")
      .send(JSON.stringify({ email: "victime@example.org", password: "x" }));

    expect(res.status).toBe(415);
  });
});

describe("FM16 — le JWT de session n'est plus renvoyé au JavaScript", () => {
  it("signin référent pose le cookie httpOnly sans renvoyer le jeton", async () => {
    const referent = await ReferentModel.create(getNewReferentFixture({ password: MOT_DE_PASSE_VALIDE } as any));

    const res = await request(getAppHelper()).post("/referent/signin").send({ email: referent.email, password: MOT_DE_PASSE_VALIDE });

    expect(res.status).toBe(200);
    expect(res.body.code).not.toBe("2FA_REQUIRED");
    expect(res.body.token).toBeUndefined();
    const cookie = String(res.headers["set-cookie"]);
    expect(cookie).toContain("jwt_ref=");
    expect(cookie).toContain("HttpOnly");
  });

  it("signin_as pose le cookie sans renvoyer le jeton", async () => {
    const cible = await ReferentModel.create(getNewReferentFixture({ role: ROLES.REFERENT_DEPARTMENT } as any));

    const res = await request(await getAppHelperWithAcl())
      .post(`/referent/signin_as/referent/${cible._id}`)
      .send();

    expect(res.status).toBe(200);
    expect(res.body.token).toBeUndefined();
    expect(String(res.headers["set-cookie"])).toContain("jwt_ref=");
  });

  it("signup_invite active le compte par cookie, sans renvoyer le jeton", async () => {
    const { invitationToken, invitationExpires } = invitationEnCours();
    const referent = await ReferentModel.create(getNewReferentFixture({ role: ROLES.REFERENT_DEPARTMENT, invitationToken, invitationExpires } as any));

    const res = await request(getAppHelper())
      .post("/referent/signup_invite")
      .send({ email: referent.email, password: MOT_DE_PASSE_VALIDE, invitationToken, acceptCGU: "true" });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeUndefined();
    expect(String(res.headers["set-cookie"])).toContain("jwt_ref=");
  });
});

describe("FM17 — jeton d'invitation référent", () => {
  it("signup_verify ne révèle pas l'email de l'invité", async () => {
    const { invitationToken, invitationExpires } = invitationEnCours();
    const referent = await ReferentModel.create(getNewReferentFixture({ role: ROLES.REFERENT_DEPARTMENT, invitationToken, invitationExpires } as any));

    const res = await request(getAppHelper()).post("/referent/signup_verify").send({ invitationToken });

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual({ firstName: referent.firstName, lastName: referent.lastName, role: referent.role, department: referent.department });
    expect(JSON.stringify(res.body)).not.toContain(referent.email);
  });

  it("signup_verify refuse l'invitation d'un compte désactivé", async () => {
    const { invitationToken, invitationExpires } = invitationEnCours();
    await ReferentModel.create(getNewReferentFixture({ status: ReferentStatus.INACTIVE, invitationToken, invitationExpires } as any));

    const res = await request(getAppHelper()).post("/referent/signup_verify").send({ invitationToken });

    expect(res.status).toBe(404);
  });

  it("signup_invite refuse d'activer un compte désactivé, même avec l'email et le jeton", async () => {
    const { invitationToken, invitationExpires } = invitationEnCours();
    const referent = await ReferentModel.create(
      getNewReferentFixture({ role: ROLES.REFERENT_DEPARTMENT, status: ReferentStatus.INACTIVE, invitationToken, invitationExpires } as any),
    );

    const res = await request(getAppHelper())
      .post("/referent/signup_invite")
      .send({ email: referent.email, password: MOT_DE_PASSE_VALIDE, invitationToken, acceptCGU: "true" });

    expect(res.status).toBe(404);
    expect(res.headers["set-cookie"]).toBeUndefined();
    const apres = await ReferentModel.findById(referent._id);
    expect(apres!.registredAt).toBeFalsy();
  });

  it("signup_invite refuse d'activer un compte supprimé", async () => {
    const { invitationToken, invitationExpires } = invitationEnCours();
    const referent = await ReferentModel.create(getNewReferentFixture({ role: ROLES.REFERENT_DEPARTMENT, deletedAt: new Date(), invitationToken, invitationExpires } as any));

    const res = await request(getAppHelper())
      .post("/referent/signup_invite")
      .send({ email: referent.email, password: MOT_DE_PASSE_VALIDE, invitationToken, acceptCGU: "true" });

    expect(res.status).toBe(404);
  });

  it("la désactivation d'un compte révoque son invitation en cours", async () => {
    const { invitationToken, invitationExpires } = invitationEnCours();
    const referent = await ReferentModel.create(getNewReferentFixture({ invitationToken, invitationExpires } as any));

    referent.set({ status: ReferentStatus.INACTIVE });
    await referent.save();

    const apres = await ReferentModel.findById(referent._id);
    expect(apres!.invitationToken).toBeFalsy();
    expect(apres!.invitationExpires).toBeFalsy();
  });

  it("une modification sans changement de statut garde l'invitation", async () => {
    const { invitationToken, invitationExpires } = invitationEnCours();
    const referent = await ReferentModel.create(getNewReferentFixture({ invitationToken, invitationExpires } as any));

    referent.set({ firstName: "Autre" });
    await referent.save();

    const apres = await ReferentModel.findById(referent._id);
    expect(apres!.invitationToken).toBe(invitationToken);
  });

  it("renew-invitation émet un nouveau jeton et l'envoie par email, au lieu de prolonger l'ancien", async () => {
    const { invitationToken, invitationExpires } = invitationEnCours();
    const referent = await ReferentModel.create(getNewReferentFixture({ role: ROLES.REFERENT_DEPARTMENT, invitationToken, invitationExpires } as any));

    const res = await request(await getAppHelperWithAcl())
      .post(`/referent/${referent._id}/renew-invitation`)
      .send();

    expect(res.status).toBe(200);
    const apres = await ReferentModel.findById(referent._id);
    expect(apres!.invitationToken).toBeTruthy();
    expect(apres!.invitationToken).not.toBe(invitationToken);
    expect(new Date(apres!.invitationExpires!).getTime()).toBeGreaterThan(invitationExpires.getTime());
    expect(mockSendTemplate).toHaveBeenCalledTimes(1);
    expect(JSON.stringify(mockSendTemplate.mock.calls[0])).toContain(apres!.invitationToken);

    const ancienLien = await request(getAppHelper()).post("/referent/signup_verify").send({ invitationToken });
    expect(ancienLien.status).toBe(404);
  });

  it("renew-invitation refuse un compte déjà activé", async () => {
    const referent = await ReferentModel.create(getNewReferentFixture({ registredAt: new Date(), ...invitationEnCours() } as any));

    const res = await request(await getAppHelperWithAcl())
      .post(`/referent/${referent._id}/renew-invitation`)
      .send();

    expect(res.status).toBe(400);
    expect(mockSendTemplate).not.toHaveBeenCalled();
  });

  it("renew-invitation refuse un compte désactivé", async () => {
    const referent = await ReferentModel.create(getNewReferentFixture({ status: ReferentStatus.INACTIVE } as any));

    const res = await request(await getAppHelperWithAcl())
      .post(`/referent/${referent._id}/renew-invitation`)
      .send();

    expect(res.status).toBe(400);
    expect(mockSendTemplate).not.toHaveBeenCalled();
  });
});

describe("GOO-16 — durée absolue de session sur GET /referent/refresh_token", () => {
  const HEURE_MS = 60 * 60 * 1000;

  async function rafraichir(claims: Record<string, unknown>) {
    const referent = await ReferentModel.create(getNewReferentFixture({ role: ROLES.REFERENT_DEPARTMENT } as any));
    const token = jwt.sign({ __v: JWT_SIGNIN_VERSION, _id: referent.id, lastLogoutAt: null, passwordChangedAt: null, ...claims }, config.JWT_SECRET);
    const res = await request(await getAppHelperWithAcl(referent))
      .get("/referent/refresh_token")
      .set("Authorization", `JWT ${token}`);
    return res;
  }

  function jetonRenouvele(res): jwt.JwtPayload {
    const cookie = String(res.headers["set-cookie"]).match(/jwt_ref=([^;]+)/)![1];
    return jwt.decode(cookie) as jwt.JwtPayload;
  }

  it("renouvelle une session récente en conservant son instant de connexion", async () => {
    const sessionStartedAt = Date.now() - HEURE_MS;

    const res = await rafraichir({ sessionStartedAt });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeUndefined();
    expect(jetonRenouvele(res).sessionStartedAt).toBe(sessionStartedAt);
  });

  it("date par son iat un jeton émis avant le correctif, et fige cette date", async () => {
    const iat = Math.floor((Date.now() - HEURE_MS) / 1000);

    const res = await rafraichir({ iat });

    expect(res.status).toBe(200);
    expect(jetonRenouvele(res).sessionStartedAt).toBe(iat * 1000);
  });

  it("refuse de renouveler au-delà de 12 h de session", async () => {
    const res = await rafraichir({ sessionStartedAt: Date.now() - 13 * HEURE_MS });

    expect(res.status).toBe(401);
    expect(String(res.headers["set-cookie"])).not.toMatch(/jwt_ref=[^;]+\./);
  });

  it("refuse de renouveler un jeton sans marqueur dont l'iat dépasse le plafond", async () => {
    const res = await rafraichir({ iat: Math.floor((Date.now() - 13 * HEURE_MS) / 1000) });

    expect(res.status).toBe(401);
  });
});
