/**
 * Lot B de l'audit du 21 septembre 2026 — non-régression.
 *
 * H62 / M43 : `signup_verify` (référent et jeune) échangeait un `invitationToken` contre un JWT de
 *             session complet, sans mot de passe ni 2FA.
 * M66       : `signup_retry` répondait 404 sur une adresse inconnue (oracle d'existence) et
 *             régénérait l'invitation de n'importe quel compte, y compris déjà activé.
 * H61       : sous impersonation, `PUT /referent/` acceptait email et mot de passe.
 * L35       : `signin_as` ne vérifiait pas le statut du référent cible.
 */
import request from "supertest";
import crypto from "crypto";
import { fakerFR as faker } from "@faker-js/faker";
import { ROLES, ReferentStatus } from "snu-lib";

import getAppHelper, { getAppHelperWithAcl, resetAppAuth } from "./helpers/app";
import { dbConnect, dbClose } from "./helpers/db";
import { ReferentModel, YoungModel } from "../models";
import { getNewReferentFixture } from "./fixtures/referent";
import getNewYoungFixture from "./fixtures/young";

jest.mock("../brevo", () => ({
  ...jest.requireActual("../brevo"),
  sendEmail: () => Promise.resolve(),
  sendTemplate: () => Promise.resolve(),
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
});

describe("H62 — POST /referent/signup_verify", () => {
  it("renvoie les données de pré-remplissage du formulaire d'activation", async () => {
    const { invitationToken, invitationExpires } = invitationEnCours();
    const referent = await ReferentModel.create(getNewReferentFixture({ invitationToken, invitationExpires } as any));

    const res = await request(getAppHelper()).post("/referent/signup_verify").send({ invitationToken });

    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe(referent.email);
  });

  it("n'émet aucun jeton de session en échange du seul invitationToken", async () => {
    const { invitationToken, invitationExpires } = invitationEnCours();
    await ReferentModel.create(getNewReferentFixture({ invitationToken, invitationExpires } as any));

    const res = await request(getAppHelper()).post("/referent/signup_verify").send({ invitationToken });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeUndefined();
    expect(res.headers["set-cookie"]).toBeUndefined();
  });

  it("refuse un invitationToken expiré", async () => {
    const invitationToken = crypto.randomBytes(20).toString("hex");
    await ReferentModel.create(getNewReferentFixture({ invitationToken, invitationExpires: new Date(Date.now() - 1000) } as any));

    const res = await request(getAppHelper()).post("/referent/signup_verify").send({ invitationToken });

    expect(res.status).toBe(404);
  });
});

describe("M43 — POST /young/signup_verify", () => {
  it("n'émet aucun jeton de session en échange du seul invitationToken", async () => {
    const { invitationToken, invitationExpires } = invitationEnCours();
    await YoungModel.create(getNewYoungFixture({ invitationToken, invitationExpires } as any));

    const res = await request(getAppHelper()).post("/young/signup_verify").send({ invitationToken });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeUndefined();
    expect(res.headers["set-cookie"]).toBeUndefined();
  });
});

describe("M66 — POST /referent/signup_retry", () => {
  it("répond 200 sur une adresse inconnue, comme sur une adresse connue", async () => {
    const referent = await ReferentModel.create(getNewReferentFixture());

    const connu = await request(getAppHelper()).post("/referent/signup_retry").send({ email: referent.email });
    const inconnu = await request(getAppHelper())
      .post("/referent/signup_retry")
      .send({ email: `${faker.string.uuid()}@example.org` });

    expect(inconnu.status).toBe(connu.status);
    expect(inconnu.status).toBe(200);
    expect(inconnu.body).toEqual(connu.body);
  });

  it("régénère l'invitation d'un compte non encore activé", async () => {
    // Invitation émise il y a cinq jours : hors de la fenêtre anti-spam.
    const invitationToken = crypto.randomBytes(20).toString("hex");
    const referent = await ReferentModel.create(getNewReferentFixture({ invitationToken, invitationExpires: new Date(Date.now() + 2 * 24 * 3600 * 1000) } as any));

    const res = await request(getAppHelper()).post("/referent/signup_retry").send({ email: referent.email });

    expect(res.status).toBe(200);
    const apres = await ReferentModel.findById(referent._id);
    expect(apres!.invitationToken).not.toBe(invitationToken);
    expect(apres!.invitationToken).toBeTruthy();
  });

  it("ne régénère pas l'invitation d'un compte déjà activé", async () => {
    const { invitationToken, invitationExpires } = invitationEnCours();
    const referent = await ReferentModel.create(getNewReferentFixture({ registredAt: new Date(), lastLoginAt: new Date(), invitationToken, invitationExpires } as any));

    const res = await request(getAppHelper()).post("/referent/signup_retry").send({ email: referent.email });

    expect(res.status).toBe(200);
    const apres = await ReferentModel.findById(referent._id);
    expect(apres!.invitationToken).toBe(invitationToken);
  });

  it("ne régénère pas l'invitation d'un compte désactivé", async () => {
    const { invitationToken, invitationExpires } = invitationEnCours();
    const referent = await ReferentModel.create(getNewReferentFixture({ status: ReferentStatus.INACTIVE, invitationToken, invitationExpires } as any));

    const res = await request(getAppHelper()).post("/referent/signup_retry").send({ email: referent.email });

    expect(res.status).toBe(200);
    const apres = await ReferentModel.findById(referent._id);
    expect(apres!.invitationToken).toBe(invitationToken);
  });

  it("ne renvoie pas une nouvelle invitation à chaque appel (anti-spam)", async () => {
    const referent = await ReferentModel.create(getNewReferentFixture());

    const premier = await request(getAppHelper()).post("/referent/signup_retry").send({ email: referent.email });
    expect(premier.status).toBe(200);
    const apresPremier = await ReferentModel.findById(referent._id);
    const tokenEmis = apresPremier!.invitationToken;
    expect(tokenEmis).toBeTruthy();

    const second = await request(getAppHelper()).post("/referent/signup_retry").send({ email: referent.email });

    expect(second.status).toBe(200);
    const apresSecond = await ReferentModel.findById(referent._id);
    expect(apresSecond!.invitationToken).toBe(tokenEmis);
  });
});

describe("H61 — PUT /referent/ sous impersonation", () => {
  async function appImpersonant(victime: any) {
    const admin = await ReferentModel.create(getNewReferentFixture({ role: ROLES.ADMIN } as any));
    victime.impersonateId = admin._id;
    return getAppHelperWithAcl(victime);
  }

  it("refuse de changer l'adresse email du compte impersoné", async () => {
    const victime: any = await ReferentModel.create(getNewReferentFixture({ role: ROLES.REFERENT_DEPARTMENT } as any));
    const emailOrigine = victime.email;

    const res = await request(await appImpersonant(victime))
      .put("/referent/")
      .send({ email: `attaquant-${faker.string.uuid()}@example.org` });

    expect(res.status).toBe(403);
    const apres = await ReferentModel.findById(victime._id);
    expect(apres!.email).toBe(emailOrigine);
  });

  it("refuse de changer le mot de passe du compte impersoné", async () => {
    const victime: any = await ReferentModel.create(getNewReferentFixture({ role: ROLES.REFERENT_DEPARTMENT, password: MOT_DE_PASSE_VALIDE } as any));
    const hashOrigine = (await ReferentModel.findById(victime._id).select("password"))!.password;

    const res = await request(await appImpersonant(victime))
      .put("/referent/")
      .send({ email: victime.email, password: "Attaquant1234!@#$" });

    expect(res.status).toBe(403);
    const apres = await ReferentModel.findById(victime._id).select("password");
    expect(apres!.password).toBe(hashOrigine);
  });

  it("laisse enregistrer le formulaire de profil qui renvoie l'email courant", async () => {
    const victime: any = await ReferentModel.create(getNewReferentFixture({ role: ROLES.REFERENT_DEPARTMENT } as any));

    const res = await request(await appImpersonant(victime))
      .put("/referent/")
      .send({ email: victime.email, firstName: "Prenom", lastName: "NOM" });

    expect(res.status).toBe(200);
    const apres = await ReferentModel.findById(victime._id);
    expect(apres!.firstName).toBe("Prenom");
  });

  it("laisse un référent non impersoné changer son propre email", async () => {
    const referent: any = await ReferentModel.create(getNewReferentFixture({ role: ROLES.REFERENT_DEPARTMENT } as any));
    const nouvelEmail = `nouveau-${faker.string.uuid()}@example.org`;

    const res = await request(await getAppHelperWithAcl(referent))
      .put("/referent/")
      .send({ email: nouvelEmail });

    expect(res.status).toBe(200);
    const apres = await ReferentModel.findById(referent._id);
    expect(apres!.email).toBe(nouvelEmail);
  });
});

describe("L35 — POST /referent/signin_as/referent/:id", () => {
  it("refuse de prendre la place d'un référent désactivé", async () => {
    const inactif = await ReferentModel.create(getNewReferentFixture({ role: ROLES.REFERENT_DEPARTMENT, status: ReferentStatus.INACTIVE } as any));

    const res = await request(await getAppHelperWithAcl())
      .post(`/referent/signin_as/referent/${inactif._id}`)
      .send();

    expect(res.status).toBe(403);
    expect(res.body.token).toBeUndefined();
  });

  it("refuse de prendre la place d'un référent supprimé", async () => {
    const supprime = await ReferentModel.create(getNewReferentFixture({ role: ROLES.REFERENT_DEPARTMENT, deletedAt: new Date() } as any));

    const res = await request(await getAppHelperWithAcl())
      .post(`/referent/signin_as/referent/${supprime._id}`)
      .send();

    expect(res.status).toBe(403);
    expect(res.body.token).toBeUndefined();
  });

  it("laisse prendre la place d'un référent actif", async () => {
    const actif = await ReferentModel.create(getNewReferentFixture({ role: ROLES.REFERENT_DEPARTMENT, status: ReferentStatus.ACTIVE } as any));

    const res = await request(await getAppHelperWithAcl())
      .post(`/referent/signin_as/referent/${actif._id}`)
      .send();

    expect(res.status).toBe(200);
    expect(res.body.token).toBeTruthy();
  });
});
