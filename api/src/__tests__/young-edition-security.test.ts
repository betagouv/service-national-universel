/**
 * Reproduction des constats H88 et H89 de l'audit sécurité du 21/09/2026.
 *
 * `canEditYoung` (packages/lib/src/roles.ts) n'est qu'une matrice de rôles :
 *   - `isHeadCenter` est vrai pour HEAD_CENTER / HEAD_CENTER_ADJOINT / REFERENT_SANITAIRE
 *     sans vérifier que le volontaire est affecté à une session dont l'acteur est chef de centre ;
 *   - `referentCLEAuthorized` est vrai pour REFERENT_CLASSE / ADMINISTRATEUR_CLE dès que
 *     `young.source === "CLE"`, sans vérifier la classe ni l'établissement.
 *
 * Toutes les routes d'édition du volontaire qui s'appuient sur ce helper sont donc ouvertes
 * à n'importe quel chef de centre du pays (H88) et à n'importe quel référent CLE (H89).
 */
import request from "supertest";
import { ROLES, YOUNG_SOURCE, SENDINBLUE_TEMPLATES } from "snu-lib";

import { ReferentModel, YoungModel, SessionPhase1Model, CohesionCenterModel, ClasseModel, EtablissementModel } from "../models";

import { getAppHelperWithAcl, resetAppAuth } from "./helpers/app";
import { dbConnect, dbClose } from "./helpers/db";
import { getNewReferentFixture } from "./fixtures/referent";
import getNewYoungFixture from "./fixtures/young";
import { getNewSessionPhase1Fixture } from "./fixtures/sessionPhase1";
import { getNewCohesionCenterFixture } from "./fixtures/cohesionCenter";
import { createFixtureClasse } from "./fixtures/classe";
import { createFixtureEtablissement } from "./fixtures/etablissement";
import { createReferentHelper } from "./helpers/referent";
import { createYoungHelper, getYoungByIdHelper } from "./helpers/young";

jest.mock("../brevo", () => ({
  ...jest.requireActual("../brevo"),
  sendTemplate: () => Promise.resolve(),
  sendEmail: () => Promise.resolve(),
}));

beforeAll(async () => {
  await dbConnect(__filename.slice(__dirname.length + 1, -3));
});
afterAll(dbClose);
beforeEach(async () => {
  await ReferentModel.deleteMany();
  await YoungModel.deleteMany();
  await SessionPhase1Model.deleteMany();
  await CohesionCenterModel.deleteMany();
  await ClasseModel.deleteMany();
  await EtablissementModel.deleteMany();
});
afterEach(resetAppAuth);

/** Un chef de centre rattaché à une session, et un volontaire affecté à une AUTRE session. */
async function chefDeCentreEtJeuneHorsPerimetre(role = ROLES.HEAD_CENTER) {
  const centre = await CohesionCenterModel.create(getNewCohesionCenterFixture());
  const chefDeCentre = await createReferentHelper(getNewReferentFixture({ role }));
  await SessionPhase1Model.create(
    getNewSessionPhase1Fixture({
      cohesionCenterId: centre._id.toString(),
      headCenterId: role === ROLES.HEAD_CENTER ? chefDeCentre._id.toString() : undefined,
      // getResponsibleCenterField() rattache adjoints ET référents sanitaires via `adjointsIds`
      adjointsIds: [ROLES.HEAD_CENTER_ADJOINT, ROLES.REFERENT_SANITAIRE].includes(role) ? [chefDeCentre._id.toString()] : undefined,
    } as any),
  );
  const autreSession = await SessionPhase1Model.create(getNewSessionPhase1Fixture({ cohesionCenterId: centre._id.toString() }));
  const young = await createYoungHelper(getNewYoungFixture({ sessionPhase1Id: autreSession._id.toString() }));
  return { chefDeCentre, young };
}

/** Un chef de centre et un volontaire affecté à SA session. */
async function chefDeCentreEtJeuneDansPerimetre() {
  const centre = await CohesionCenterModel.create(getNewCohesionCenterFixture());
  const chefDeCentre = await createReferentHelper(getNewReferentFixture({ role: ROLES.HEAD_CENTER }));
  const session = await SessionPhase1Model.create(getNewSessionPhase1Fixture({ cohesionCenterId: centre._id.toString(), headCenterId: chefDeCentre._id.toString() }));
  const young = await createYoungHelper(getNewYoungFixture({ sessionPhase1Id: session._id.toString() }));
  return { chefDeCentre, young };
}

/** Un référent de classe et un volontaire CLE d'une AUTRE classe / d'un autre établissement. */
async function referentCleEtJeuneHorsPerimetre(role = ROLES.REFERENT_CLASSE) {
  const referent = await createReferentHelper(getNewReferentFixture({ role }));
  const etablissement = await EtablissementModel.create(createFixtureEtablissement({ referentEtablissementIds: [], coordinateurIds: [] }));
  const classe = await ClasseModel.create(createFixtureClasse({ etablissementId: etablissement._id.toString(), referentClasseIds: [] }));
  const young = await createYoungHelper(
    getNewYoungFixture({ source: YOUNG_SOURCE.CLE, classeId: classe._id.toString(), etablissementId: etablissement._id.toString() }),
  );
  return { referent, young };
}

/** Un référent de classe et un volontaire CLE de SA classe. */
async function referentCleEtJeuneDansPerimetre() {
  const referent = await createReferentHelper(getNewReferentFixture({ role: ROLES.REFERENT_CLASSE }));
  const etablissement = await EtablissementModel.create(createFixtureEtablissement());
  const classe = await ClasseModel.create(createFixtureClasse({ etablissementId: etablissement._id.toString(), referentClasseIds: [referent._id.toString()] }));
  const young = await createYoungHelper(
    getNewYoungFixture({ source: YOUNG_SOURCE.CLE, classeId: classe._id.toString(), etablissementId: etablissement._id.toString() }),
  );
  return { referent, young };
}

describe("H88/H89 — périmètre de canEditYoung sur les routes d'édition du volontaire", () => {
  describe("PUT /young-edition/:id/identite", () => {
    it("refuse un chef de centre sur un jeune d'une autre session", async () => {
      const { chefDeCentre, young } = await chefDeCentreEtJeuneHorsPerimetre();

      const res = await request(await getAppHelperWithAcl(chefDeCentre))
        .put(`/young-edition/${young._id}/identite`)
        .send({ email: "attaquant@example.org" });

      expect(res.statusCode).toEqual(403);
      expect((await getYoungByIdHelper(young._id))?.email).toEqual(young.email);
    });

    it("refuse un adjoint de chef de centre sur un jeune d'une autre session", async () => {
      const { chefDeCentre, young } = await chefDeCentreEtJeuneHorsPerimetre(ROLES.HEAD_CENTER_ADJOINT);

      const res = await request(await getAppHelperWithAcl(chefDeCentre))
        .put(`/young-edition/${young._id}/identite`)
        .send({ email: "attaquant@example.org" });

      expect(res.statusCode).toEqual(403);
    });

    it("refuse un référent sanitaire sur un jeune d'une autre session", async () => {
      const { chefDeCentre, young } = await chefDeCentreEtJeuneHorsPerimetre(ROLES.REFERENT_SANITAIRE);

      const res = await request(await getAppHelperWithAcl(chefDeCentre))
        .put(`/young-edition/${young._id}/identite`)
        .send({ email: "attaquant@example.org" });

      expect(res.statusCode).toEqual(403);
    });

    it("refuse un référent de classe sur un jeune CLE d'une autre classe", async () => {
      const { referent, young } = await referentCleEtJeuneHorsPerimetre();

      const res = await request(await getAppHelperWithAcl(referent))
        .put(`/young-edition/${young._id}/identite`)
        .send({ email: "attaquant@example.org" });

      expect(res.statusCode).toEqual(403);
      expect((await getYoungByIdHelper(young._id))?.email).toEqual(young.email);
    });

    it("refuse un administrateur CLE sur un jeune CLE d'un autre établissement", async () => {
      const { referent, young } = await referentCleEtJeuneHorsPerimetre(ROLES.ADMINISTRATEUR_CLE);

      const res = await request(await getAppHelperWithAcl(referent))
        .put(`/young-edition/${young._id}/identite`)
        .send({ email: "attaquant@example.org" });

      expect(res.statusCode).toEqual(403);
    });

    it("autorise un chef de centre sur un jeune de sa session", async () => {
      const { chefDeCentre, young } = await chefDeCentreEtJeuneDansPerimetre();

      const res = await request(await getAppHelperWithAcl(chefDeCentre))
        .put(`/young-edition/${young._id}/identite`)
        .send({ lastName: "NOUVEAU" });

      expect(res.statusCode).toEqual(200);
    });

    it("autorise un référent de classe sur un jeune de sa classe", async () => {
      const { referent, young } = await referentCleEtJeuneDansPerimetre();

      const res = await request(await getAppHelperWithAcl(referent))
        .put(`/young-edition/${young._id}/identite`)
        .send({ lastName: "NOUVEAU" });

      expect(res.statusCode).toEqual(200);
    });
  });

  describe("PUT /young-edition/:id/situationparents", () => {
    it("refuse un chef de centre sur un jeune d'une autre session", async () => {
      const { chefDeCentre, young } = await chefDeCentreEtJeuneHorsPerimetre();

      const res = await request(await getAppHelperWithAcl(chefDeCentre))
        .put(`/young-edition/${young._id}/situationparents`)
        .send({ parent1Email: "attaquant@example.org" });

      expect(res.statusCode).toEqual(403);
      expect((await getYoungByIdHelper(young._id))?.parent1Email).toEqual(young.parent1Email);
    });

    it("refuse un référent de classe sur un jeune CLE d'une autre classe", async () => {
      const { referent, young } = await referentCleEtJeuneHorsPerimetre();

      const res = await request(await getAppHelperWithAcl(referent))
        .put(`/young-edition/${young._id}/situationparents`)
        .send({ parent1Email: "attaquant@example.org" });

      expect(res.statusCode).toEqual(403);
    });
  });

  describe("PUT /young/:id/phase2/preference", () => {
    it("refuse un chef de centre sur un jeune d'une autre session", async () => {
      const { chefDeCentre, young } = await chefDeCentreEtJeuneHorsPerimetre();

      const res = await request(await getAppHelperWithAcl(chefDeCentre))
        .put(`/young/${young._id}/phase2/preference`)
        .send({ professionnalProject: "UNIFORM" });

      expect(res.statusCode).toEqual(403);
    });

    it("refuse un référent de classe sur un jeune CLE d'une autre classe", async () => {
      const { referent, young } = await referentCleEtJeuneHorsPerimetre();

      const res = await request(await getAppHelperWithAcl(referent))
        .put(`/young/${young._id}/phase2/preference`)
        .send({ professionnalProject: "UNIFORM" });

      expect(res.statusCode).toEqual(403);
    });
  });

  describe("POST /young/:id/email/:template", () => {
    it("refuse un chef de centre sur un jeune d'une autre session", async () => {
      const { chefDeCentre, young } = await chefDeCentreEtJeuneHorsPerimetre();

      const res = await request(await getAppHelperWithAcl(chefDeCentre))
        .post(`/young/${young._id}/email/${SENDINBLUE_TEMPLATES.young.WITHDRAWN}`)
        .send({});

      expect(res.statusCode).toEqual(403);
    });

    it("refuse un référent de classe sur un jeune CLE d'une autre classe", async () => {
      const { referent, young } = await referentCleEtJeuneHorsPerimetre();

      const res = await request(await getAppHelperWithAcl(referent))
        .post(`/young/${young._id}/email/${SENDINBLUE_TEMPLATES.young.WITHDRAWN}`)
        .send({});

      expect(res.statusCode).toEqual(403);
    });
  });
});
