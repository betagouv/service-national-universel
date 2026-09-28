/**
 * GOO-71 (Lot P27, audit de sécurité de la production du 25/09/2026) — non-régression.
 *
 * PH14 : `restore_signin` recréait une session ADMIN neuve depuis tout jeton d'impersonation,
 *        sans revérifier l'état de l'usurpateur (logout, changement de mot de passe, plafond de
 *        12h de session) — un jeton capturé une fois permettait de régénérer indéfiniment une
 *        session ADMIN complète. `signin_as` ne refusait ni l'auto-impersonation ni le cumul de
 *        sessions déjà empruntées.
 * PL7  : `signin_as` n'était pas journalisé — aucune recherche d'abus fiable n'était possible
 *        (le volet « l'usurpateur est cherché dans ReferentModel, quel que soit le modèle cible »
 *        est couvert dans passport.test.ts).
 */
import request from "supertest";
import jwt from "jsonwebtoken";
import { ROLES } from "snu-lib";

import { getAppHelperWithAcl, resetAppAuth } from "./helpers/app";
import { dbConnect, dbClose } from "./helpers/db";
import { ReferentModel } from "../models";
import { getNewReferentFixture } from "./fixtures/referent";
import { config } from "../config";
import { JWT_SIGNIN_VERSION } from "../jwt-options";
import { logger } from "../logger";

jest.mock("../brevo", () => ({
  ...jest.requireActual("../brevo"),
  sendEmail: () => Promise.resolve(),
  sendTemplate: () => Promise.resolve(),
}));

const HEURE_MS = 60 * 60 * 1000;

beforeAll(async () => {
  await dbConnect(__filename.slice(__dirname.length + 1, -3));
});
afterAll(async () => {
  await dbClose();
});
afterEach(() => {
  resetAppAuth();
  jest.restoreAllMocks();
});

function cookieJwtRef(res: request.Response): string {
  return String(res.headers["set-cookie"]).match(/jwt_ref=([^;]+)/)![1];
}

describe("PH14 — POST /referent/signin_as : refus de l'auto-impersonation et du cumul", () => {
  it("refuse qu'un admin prenne sa propre place", async () => {
    const admin = await ReferentModel.create(getNewReferentFixture({ role: ROLES.ADMIN } as any));

    const res = await request(await getAppHelperWithAcl(admin))
      .post(`/referent/signin_as/referent/${admin._id}`)
      .send();

    expect(res.status).toBe(403);
    expect(res.headers["set-cookie"]).toBeUndefined();
  });

  it("refuse d'emprunter une seconde identité depuis une session déjà empruntée", async () => {
    const admin = await ReferentModel.create(getNewReferentFixture({ role: ROLES.ADMIN } as any));
    const cible = await ReferentModel.create(getNewReferentFixture({ role: ROLES.REFERENT_DEPARTMENT } as any));
    const dejaEmpruntee: any = await ReferentModel.create(getNewReferentFixture({ role: ROLES.REFERENT_REGION } as any));
    dejaEmpruntee.impersonateId = admin._id;

    const res = await request(await getAppHelperWithAcl(dejaEmpruntee))
      .post(`/referent/signin_as/referent/${cible._id}`)
      .send();

    expect(res.status).toBe(403);
    expect(res.headers["set-cookie"]).toBeUndefined();
  });
});

describe("PL7 — POST /referent/signin_as est journalisé", () => {
  it("journalise l'usurpateur et la cible, sans email ni autre PII", async () => {
    const admin = await ReferentModel.create(getNewReferentFixture({ role: ROLES.ADMIN } as any));
    const cible = await ReferentModel.create(getNewReferentFixture({ role: ROLES.REFERENT_DEPARTMENT } as any));
    const infoSpy = jest.spyOn(logger, "info");

    const res = await request(await getAppHelperWithAcl(admin))
      .post(`/referent/signin_as/referent/${cible._id}`)
      .send();

    expect(res.status).toBe(200);
    const messages = infoSpy.mock.calls.map((call) => String(call[0]));
    const messageSigninAs = messages.find((message) => message.includes("signin_as"));
    expect(messageSigninAs).toBeDefined();
    expect(messageSigninAs).toContain(String(admin._id));
    expect(messageSigninAs).toContain(String(cible._id));
    expect(messageSigninAs).not.toContain(cible.email);
  });
});

describe("PH14 — GET /referent/restore_signin : revérification de l'état de l'usurpateur", () => {
  async function emprunterIdentite(sessionStartedAt = Date.now() - HEURE_MS) {
    const admin: any = await ReferentModel.create(getNewReferentFixture({ role: ROLES.ADMIN } as any));
    const cible = await ReferentModel.create(getNewReferentFixture({ role: ROLES.REFERENT_DEPARTMENT } as any));
    const jetonAdminCourant = jwt.sign(
      { __v: JWT_SIGNIN_VERSION, _id: admin.id, lastLogoutAt: admin.lastLogoutAt, passwordChangedAt: admin.passwordChangedAt, sessionStartedAt },
      config.JWT_SECRET,
    );

    const signinAs = await request(await getAppHelperWithAcl(admin))
      .post(`/referent/signin_as/referent/${cible._id}`)
      .set("Authorization", `JWT ${jetonAdminCourant}`)
      .send();
    expect(signinAs.status).toBe(200);

    return { admin, cible, token: cookieJwtRef(signinAs), sessionStartedAt };
  }

  it("restaure la session ADMIN quand rien n'a changé", async () => {
    const { admin, cible, token } = await emprunterIdentite();

    const res = await request(await getAppHelperWithAcl(cible))
      .get("/referent/restore_signin")
      .set("Cookie", `jwt_ref=${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data._id).toBe(String(admin._id));
    expect(String(res.headers["set-cookie"])).toContain("jwt_ref=");
  });

  it("propage l'instant de connexion d'origine plutôt que de le réinitialiser", async () => {
    const { cible, token, sessionStartedAt } = await emprunterIdentite();

    const res = await request(await getAppHelperWithAcl(cible))
      .get("/referent/restore_signin")
      .set("Cookie", `jwt_ref=${token}`);

    expect(res.status).toBe(200);
    const decodedRestore = jwt.decode(cookieJwtRef(res)) as jwt.JwtPayload;
    expect(decodedRestore.sessionStartedAt).toBe(sessionStartedAt);
  });

  it("refuse de restaurer après un changement de mot de passe de l'usurpateur", async () => {
    const { admin, cible, token } = await emprunterIdentite();
    await ReferentModel.updateOne({ _id: admin._id }, { passwordChangedAt: new Date() });

    const res = await request(await getAppHelperWithAcl(cible))
      .get("/referent/restore_signin")
      .set("Cookie", `jwt_ref=${token}`);

    expect(res.status).toBe(401);
  });

  it("refuse de restaurer après une déconnexion de l'usurpateur ailleurs", async () => {
    const { admin, cible, token } = await emprunterIdentite();
    await ReferentModel.updateOne({ _id: admin._id }, { lastLogoutAt: new Date() });

    const res = await request(await getAppHelperWithAcl(cible))
      .get("/referent/restore_signin")
      .set("Cookie", `jwt_ref=${token}`);

    expect(res.status).toBe(401);
  });

  it("refuse de restaurer au-delà du plafond de 12h de session", async () => {
    const admin = await ReferentModel.create(getNewReferentFixture({ role: ROLES.ADMIN } as any));
    const cible = await ReferentModel.create(getNewReferentFixture({ role: ROLES.REFERENT_DEPARTMENT } as any));
    const token = jwt.sign(
      {
        __v: JWT_SIGNIN_VERSION,
        _id: cible.id,
        _impersonateId: admin.id,
        lastLogoutAt: cible.lastLogoutAt,
        passwordChangedAt: cible.passwordChangedAt,
        _impersonatorLastLogoutAt: admin.lastLogoutAt,
        _impersonatorPasswordChangedAt: admin.passwordChangedAt,
        sessionStartedAt: Date.now() - 13 * HEURE_MS,
      },
      config.JWT_SECRET,
    );

    const res = await request(await getAppHelperWithAcl(cible))
      .get("/referent/restore_signin")
      .set("Cookie", `jwt_ref=${token}`);

    expect(res.status).toBe(401);
  });

  it("refuse un jeton sans usurpateur (_impersonateId absent)", async () => {
    const cible = await ReferentModel.create(getNewReferentFixture({ role: ROLES.REFERENT_DEPARTMENT } as any));
    const token = jwt.sign(
      { __v: JWT_SIGNIN_VERSION, _id: cible.id, lastLogoutAt: cible.lastLogoutAt, passwordChangedAt: cible.passwordChangedAt, sessionStartedAt: Date.now() },
      config.JWT_SECRET,
    );

    const res = await request(await getAppHelperWithAcl(cible))
      .get("/referent/restore_signin")
      .set("Cookie", `jwt_ref=${token}`);

    expect(res.status).toBe(401);
  });
});
