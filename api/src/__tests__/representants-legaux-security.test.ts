/**
 * Reproduction du groupe G2 de l'audit sécurité du 21/09/2026 :
 * représentants légaux et consentement parental.
 *
 *   H34  POST /representants-legaux/accept-ri        — le jeune ciblé vient du body, pas du jeton parent
 *   H40  PUT  /young/account/parents                 — changer parent1Email ne fait pas tourner le jeton parent 1
 *   M27  middleware /representants-legaux/*          — jeton parent sans expiration
 *   M28, M29  PUT /representants-legaux/representant-fromFranceConnect/:id — route supprimée avec
 *             FranceConnect (lot T3), cf. france-connect-routes-supprimees.test.ts
 *   M54  PUT  /young/inscription2023/relance         — relances illimitées vers l'adresse parent
 *
 * (L38, `GET /young-edition/:id/remider/:idParent`, est couvert dans young-edition-security.test.ts.)
 */
import request from "supertest";
import { ERRORS, SENDINBLUE_TEMPLATES } from "snu-lib";

import { YoungModel, CohortModel } from "../models";

import { getAppHelperWithAcl, resetAppAuth } from "./helpers/app";
import { dbConnect, dbClose } from "./helpers/db";
import getNewYoungFixture from "./fixtures/young";
import { createYoungHelper, getYoungByIdHelper } from "./helpers/young";
import { createCohortHelper } from "./helpers/cohort";
import getNewCohortFixture from "./fixtures/cohort";

jest.mock("../redis", () => {
  const store: Record<string, string> = {};
  const client = {
    setEx: (key: string, _ttl: number, value: string) => {
      store[key] = value;
      return Promise.resolve();
    },
    get: (key: string) => Promise.resolve(store[key]),
    del: (key: string) => {
      delete store[key];
      return Promise.resolve(1);
    },
  };
  return { getRedisClient: () => client, initRedisClient: () => Promise.resolve(), closeRedisClient: () => Promise.resolve() };
});

const sendTemplate = jest.fn();
jest.mock("../brevo", () => ({
  ...jest.requireActual("../brevo"),
  sendTemplate: (...args) => sendTemplate(...args),
  sendEmail: () => Promise.resolve(),
}));

beforeAll(async () => {
  await dbConnect(__filename.slice(__dirname.length + 1, -3));
});
afterAll(dbClose);
beforeEach(async () => {
  await YoungModel.deleteMany();
  await CohortModel.deleteMany();
  sendTemplate.mockReset();
  sendTemplate.mockResolvedValue(undefined);
});
afterEach(resetAppAuth);

const PARENT1_TOKEN = "jeton-parent-1-du-jeune-a";
const PARENT2_TOKEN = "jeton-parent-2-du-jeune-a";

async function createYoungAvecJetonsParents(fields: Record<string, any> = {}) {
  return createYoungHelper(
    getNewYoungFixture({
      status: "IN_PROGRESS",
      parent1Status: "mother",
      parent1FirstName: "Marie",
      parent1LastName: "DUPONT",
      parent1Email: "marie.dupont@example.org",
      parent1Phone: "0600000001",
      parent1PhoneZone: "FRANCE",
      parent1FromFranceConnect: "false",
      parent1Inscription2023Token: PARENT1_TOKEN,
      parent2Status: "father",
      parent2FirstName: "Paul",
      parent2LastName: "DUPONT",
      parent2Email: "paul.dupont@example.org",
      parent2Phone: "0600000002",
      parent2PhoneZone: "FRANCE",
      parent2FromFranceConnect: "false",
      parent2Inscription2023Token: PARENT2_TOKEN,
      ...fields,
    } as any),
  );
}

describe("G2 — représentants légaux et consentement parental", () => {
  describe("H34 — POST /representants-legaux/accept-ri", () => {
    it("n'accepte pas le règlement intérieur d'un autre jeune que celui du jeton", async () => {
      const jeuneAvecJeton = await createYoungAvecJetonsParents();
      const victime = await createYoungHelper(getNewYoungFixture({ status: "IN_PROGRESS" } as any));

      const res = await request(await getAppHelperWithAcl())
        .post(`/representants-legaux/accept-ri?token=${PARENT1_TOKEN}&parent=1`)
        .send({ _id: victime._id.toString() });

      // la cible du body est ignorée : c'est le volontaire du jeton qui est validé, jamais un autre
      const victimeApres = await getYoungByIdHelper(victime._id);
      expect(victimeApres!.parent1ValidationDate).toBeUndefined();

      expect(res.statusCode).toEqual(200);
      const porteurApres = await getYoungByIdHelper(jeuneAvecJeton._id);
      expect(porteurApres!.parent1ValidationDate).toBeTruthy();
    });

    it("accepte le règlement intérieur du jeune porteur du jeton", async () => {
      const jeune = await createYoungAvecJetonsParents();

      const res = await request(await getAppHelperWithAcl())
        .post(`/representants-legaux/accept-ri?token=${PARENT1_TOKEN}&parent=1`)
        .send({ _id: jeune._id.toString() });

      expect(res.statusCode).toEqual(200);
      const apres = await getYoungByIdHelper(jeune._id);
      expect(apres!.parent1ValidationDate).toBeTruthy();
    });

    it("ne renvoie jamais les jetons parents dans la réponse", async () => {
      const jeune = await createYoungAvecJetonsParents();

      const res = await request(await getAppHelperWithAcl())
        .post(`/representants-legaux/accept-ri?token=${PARENT1_TOKEN}&parent=1`)
        .send({ _id: jeune._id.toString() });

      expect(res.body.data?.parent1Inscription2023Token).toBeUndefined();
      expect(res.body.data?.parent2Inscription2023Token).toBeUndefined();
    });
  });

  describe("H40 — PUT /young/account/parents", () => {
    const corpsParents = (overrides: Record<string, any> = {}) => ({
      parent1Status: "mother",
      parent1FirstName: "Marie",
      parent1LastName: "DUPONT",
      parent1Email: "marie.dupont@example.org",
      parent1Phone: "0600000001",
      parent1PhoneZone: "FRANCE",
      parent2: true,
      parent2Status: "father",
      parent2FirstName: "Paul",
      parent2LastName: "DUPONT",
      parent2Email: "paul.dupont@example.org",
      parent2Phone: "0600000002",
      parent2PhoneZone: "FRANCE",
      ...overrides,
    });

    it("fait tourner le jeton du parent 1 quand son adresse email change", async () => {
      const jeune = await createYoungAvecJetonsParents();

      const res = await request(await getAppHelperWithAcl(jeune))
        .put("/young/account/parents")
        .send(corpsParents({ parent1Email: "adresse.controlee.par.le.jeune@example.org" }));

      expect(res.statusCode).toEqual(200);
      const apres = await getYoungByIdHelper(jeune._id);
      expect(apres!.parent1Inscription2023Token).not.toEqual(PARENT1_TOKEN);
      expect(apres!.parent1Inscription2023Token).toBeTruthy();
    });

    it("conserve le jeton du parent 2 quand son adresse email ne change pas", async () => {
      const jeune = await createYoungAvecJetonsParents();

      const res = await request(await getAppHelperWithAcl(jeune))
        .put("/young/account/parents")
        .send(corpsParents());

      expect(res.statusCode).toEqual(200);
      const apres = await getYoungByIdHelper(jeune._id);
      expect(apres!.parent1Inscription2023Token).toEqual(PARENT1_TOKEN);
      expect(apres!.parent2Inscription2023Token).toEqual(PARENT2_TOKEN);
    });

    it("fait tourner le jeton du parent 2 quand son adresse email change", async () => {
      const jeune = await createYoungAvecJetonsParents();

      const res = await request(await getAppHelperWithAcl(jeune))
        .put("/young/account/parents")
        .send(corpsParents({ parent2Email: "autre.parent2@example.org" }));

      expect(res.statusCode).toEqual(200);
      const apres = await getYoungByIdHelper(jeune._id);
      expect(apres!.parent2Inscription2023Token).not.toEqual(PARENT2_TOKEN);
      expect(apres!.parent2Inscription2023Token).toBeTruthy();
    });

    it("ne renvoie jamais les jetons parents au jeune", async () => {
      const jeune = await createYoungAvecJetonsParents();

      const res = await request(await getAppHelperWithAcl(jeune))
        .put("/young/account/parents")
        .send(corpsParents());

      expect(res.body.data?.parent1Inscription2023Token).toBeUndefined();
      expect(res.body.data?.parent2Inscription2023Token).toBeUndefined();
    });
  });

  describe("M27 — expiration du jeton parent", () => {
    it("refuse un jeton parent expiré", async () => {
      const jeune = await createYoungAvecJetonsParents({
        parent1Inscription2023TokenExpiresAt: new Date(Date.now() - 1000),
      });

      const res = await request(await getAppHelperWithAcl())
        .get(`/representants-legaux/young?token=${PARENT1_TOKEN}&parent=1`)
        .send();

      expect(res.statusCode).toEqual(403);
      expect(res.body.code).toEqual(ERRORS.OPERATION_UNAUTHORIZED);
      expect(jeune).toBeTruthy();
    });

    it("accepte un jeton parent encore valide", async () => {
      await createYoungAvecJetonsParents({
        parent1Inscription2023TokenExpiresAt: new Date(Date.now() + 60_000),
      });

      const res = await request(await getAppHelperWithAcl())
        .get(`/representants-legaux/young?token=${PARENT1_TOKEN}&parent=1`)
        .send();

      expect(res.statusCode).toEqual(200);
    });

    it("accepte un jeton historique sans date d'expiration", async () => {
      await createYoungAvecJetonsParents();

      const res = await request(await getAppHelperWithAcl())
        .get(`/representants-legaux/young?token=${PARENT1_TOKEN}&parent=1`)
        .send();

      expect(res.statusCode).toEqual(200);
    });

    it("date l'expiration du jeton émis lors d'un changement d'email", async () => {
      const jeune = await createYoungAvecJetonsParents();

      const res = await request(await getAppHelperWithAcl(jeune))
        .put("/young/account/parents")
        .send({
          parent1Status: "mother",
          parent1FirstName: "Marie",
          parent1LastName: "DUPONT",
          parent1Email: "nouvelle.adresse@example.org",
          parent1Phone: "0600000001",
          parent1PhoneZone: "FRANCE",
          parent2: true,
          parent2Status: "father",
          parent2FirstName: "Paul",
          parent2LastName: "DUPONT",
          parent2Email: "paul.dupont@example.org",
          parent2Phone: "0600000002",
          parent2PhoneZone: "FRANCE",
        });

      expect(res.statusCode).toEqual(200);
      const apres = await getYoungByIdHelper(jeune._id);
      expect(apres!.parent1Inscription2023TokenExpiresAt).toBeTruthy();
      expect(new Date(apres!.parent1Inscription2023TokenExpiresAt as any).getTime()).toBeGreaterThan(Date.now());
    });
  });

  describe("M54 — PUT /young/inscription2023/relance", () => {
    async function jeuneEnAttenteDeConsentement() {
      const cohort = await createCohortHelper(getNewCohortFixture({ dateStart: new Date(Date.now() + 86_400_000) }));
      return createYoungAvecJetonsParents({
        cohort: cohort.name,
        cohortId: cohort._id.toString(),
        parentAllowSNU: undefined,
        inscriptionStep2023: "DONE",
      });
    }

    it("refuse une deuxième relance immédiate", async () => {
      const jeune = await jeuneEnAttenteDeConsentement();
      const app = await getAppHelperWithAcl(jeune);

      const premiere = await request(app).put("/young/inscription2023/relance").send();
      expect(premiere.statusCode).toEqual(200);
      const relancesApresPremiere = sendTemplate.mock.calls.filter((call) => call[0] === SENDINBLUE_TEMPLATES.parent.PARENT1_CONSENT).length;
      expect(relancesApresPremiere).toEqual(1);

      const seconde = await request(await getAppHelperWithAcl(await getYoungByIdHelper(jeune._id))).put("/young/inscription2023/relance").send();
      expect(seconde.statusCode).toEqual(429);
      const relancesApresSeconde = sendTemplate.mock.calls.filter((call) => call[0] === SENDINBLUE_TEMPLATES.parent.PARENT1_CONSENT).length;
      expect(relancesApresSeconde).toEqual(1);
    });

    it("autorise une relance une fois le délai écoulé", async () => {
      const jeune = await jeuneEnAttenteDeConsentement();

      const premiere = await request(await getAppHelperWithAcl(jeune)).put("/young/inscription2023/relance").send();
      expect(premiere.statusCode).toEqual(200);

      await YoungModel.updateOne({ _id: jeune._id }, { $set: { parentConsentRelanceSentAt: new Date(Date.now() - 48 * 3600 * 1000) } });

      const seconde = await request(await getAppHelperWithAcl(await getYoungByIdHelper(jeune._id))).put("/young/inscription2023/relance").send();
      expect(seconde.statusCode).toEqual(200);
      const relances = sendTemplate.mock.calls.filter((call) => call[0] === SENDINBLUE_TEMPLATES.parent.PARENT1_CONSENT).length;
      expect(relances).toEqual(2);
    });
  });
});
