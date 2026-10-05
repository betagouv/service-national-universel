import request from "supertest";
import { EQUIVALENCE_STATUS, MissionEquivalenceType, ROLES } from "snu-lib";
import getAppHelper from "./helpers/app";
import { dbConnect, dbClose } from "./helpers/db";
import { createReferentHelper } from "./helpers/referent";
import { createMissionEquivalenceHelpers } from "./helpers/equivalence";
import { createFixtureMissionEquivalence } from "./fixtures/equivalence";
import { getNewReferentFixture } from "./fixtures/referent";
import { YoungBuilder } from "./fixtures/builders/YoungBuilder";
import { CohortBuilder } from "./fixtures/builders/CohortBuilder";
import { MissionEquivalenceModel, YoungModel, ReferentModel, CohortModel } from "../models";
import { listFiles, deleteFilesByList } from "../utils";

jest.mock("../utils", () => ({
  ...jest.requireActual("../utils"),
  listFiles: jest.fn(),
  deleteFilesByList: jest.fn(),
}));

jest.mock("../application/applicationNotificationService", () => ({
  notifyReferentsEquivalenceSubmitted: jest.fn(),
  notifyYoungEquivalenceSubmitted: jest.fn(),
  notifyYoungChangementStatutEquivalence: jest.fn(),
}));

beforeAll(() => dbConnect(__filename.slice(__dirname.length + 1, -3)));
afterAll(dbClose);
beforeEach(async () => {
  await MissionEquivalenceModel.deleteMany({});
  await YoungModel.deleteMany({});
  await ReferentModel.deleteMany({});
  await CohortModel.deleteMany({});
  jest.clearAllMocks();
});

/**
 * Invariant : sur les routes d'équivalence, le volontaire visé et l'équivalence visée viennent de l'URL.
 * Un identifiant présent dans le corps de la requête n'a aucun effet : seul le volontaire contrôlé par
 * le périmètre de `/young/:id/phase2` reçoit ou voit modifier une équivalence.
 */

const PARIS = { department: "Paris", region: "Île-de-France" };
const NORD = { department: "Nord", region: "Hauts-de-France" };

/** Deux volontaires éligibles de territoires distincts : A est visé par l'URL, B est un tiers. */
async function givenTwoYoungs() {
  const cohort = await new CohortBuilder().published().build();
  const build = (territory: { department: string; region: string }) =>
    new YoungBuilder().eligible().inCohort(cohort._id.toString(), cohort.name).withDepartment(territory.department).withRegion(territory.region).build();
  const youngA = await build(PARIS);
  const youngB = await build(NORD);
  return { cohort, youngA, youngB };
}

function actorOf(role: string, territory = PARIS) {
  return createReferentHelper(getNewReferentFixture({ role, department: [territory.department], region: territory.region }));
}

function equivalenceBody(extra: Record<string, unknown> = {}) {
  return {
    type: "BAFA",
    structureName: "Structure du volontaire",
    address: "1 rue de la Paix",
    zip: "75001",
    city: "Paris",
    startDate: "2025-01-01",
    endDate: "2025-01-02",
    contactFullName: "Jane Doe",
    contactEmail: "jane.doe@example.com",
    files: ["file1.pdf"],
    missionDuration: 84,
    ...extra,
  };
}

function seedEquivalence(young: { _id: unknown }, fields: Partial<MissionEquivalenceType> = {}) {
  return createMissionEquivalenceHelpers(createFixtureMissionEquivalence({ youngId: String(young._id), address: "Adresse initiale", ...fields }));
}

const snapshotEquivalence = (id: unknown) => MissionEquivalenceModel.findById(id).lean();
const snapshotYoung = (id: unknown) => YoungModel.findById(id).lean();
const equivalencesOf = (young: { _id: unknown }) => MissionEquivalenceModel.find({ youngId: String(young._id) }).lean();

describe("Équivalences : l'identifiant vient de l'URL, jamais du corps", () => {
  describe("POST /young/:id/phase2/equivalence", () => {
    it("un volontaire ne crée pas d'équivalence chez un autre volontaire en glissant son identifiant dans le corps", async () => {
      const { youngA, youngB } = await givenTwoYoungs();
      const youngBBefore = await snapshotYoung(youngB._id);

      const res = await request(getAppHelper(youngA))
        .post(`/young/${youngA._id}/phase2/equivalence`)
        .send(equivalenceBody({ id: youngB._id.toString(), youngId: youngB._id.toString() }));

      expect(res.status).toEqual(200);
      expect(await equivalencesOf(youngB)).toHaveLength(0);
      expect(await snapshotYoung(youngB._id)).toEqual(youngBBefore);

      const forA = await equivalencesOf(youngA);
      expect(forA).toHaveLength(1);
      expect(forA[0].status).toEqual(EQUIVALENCE_STATUS.WAITING_VERIFICATION);
      expect(res.body.data.youngId).toEqual(youngA._id.toString());
    });

    it.each([[ROLES.REFERENT_DEPARTMENT], [ROLES.REFERENT_REGION]])(
      "un %s autorisé sur le volontaire de l'URL ne crée rien pour un volontaire hors de son périmètre désigné dans le corps",
      async (role) => {
        const { youngA, youngB } = await givenTwoYoungs();
        const instructor = await actorOf(role);
        const youngBBefore = await snapshotYoung(youngB._id);

        const res = await request(getAppHelper(instructor))
          .post(`/young/${youngA._id}/phase2/equivalence`)
          .send(equivalenceBody({ id: youngB._id.toString(), youngId: youngB._id.toString() }));

        expect(res.status).toEqual(200);
        expect(await equivalencesOf(youngB)).toHaveLength(0);
        expect(await snapshotYoung(youngB._id)).toEqual(youngBBefore);

        const forA = await equivalencesOf(youngA);
        expect(forA).toHaveLength(1);
        expect(forA[0].status).toEqual(EQUIVALENCE_STATUS.VALIDATED);
        expect(res.body.data.youngId).toEqual(youngA._id.toString());
      },
    );

    it("un admin crée l'équivalence du volontaire de l'URL, quel que soit l'identifiant du corps", async () => {
      const { youngA, youngB } = await givenTwoYoungs();
      const admin = await actorOf(ROLES.ADMIN);

      const res = await request(getAppHelper(admin))
        .post(`/young/${youngA._id}/phase2/equivalence`)
        .send(equivalenceBody({ id: youngB._id.toString() }));

      expect(res.status).toEqual(200);
      expect(await equivalencesOf(youngB)).toHaveLength(0);
      expect(await equivalencesOf(youngA)).toHaveLength(1);
      expect(res.body.data.youngId).toEqual(youngA._id.toString());
    });
  });

  describe("PUT /young/:id/phase2/equivalence/:idEquivalence", () => {
    it("un volontaire modifie l'équivalence de l'URL, pas celle désignée par le corps (même dossier)", async () => {
      const { youngA, youngB } = await givenTwoYoungs();
      const targeted = await seedEquivalence(youngA);
      const sibling = await seedEquivalence(youngA);
      const siblingBefore = await snapshotEquivalence(sibling._id);

      const res = await request(getAppHelper(youngA))
        .put(`/young/${youngA._id}/phase2/equivalence/${targeted._id}`)
        .send({ address: "Adresse corrigée", idEquivalence: sibling._id.toString(), id: youngB._id.toString() });

      expect(res.status).toEqual(200);
      expect((await snapshotEquivalence(targeted._id))?.address).toEqual("Adresse corrigée");
      expect(await snapshotEquivalence(sibling._id)).toEqual(siblingBefore);
    });

    it("un volontaire ne touche pas l'équivalence d'un autre volontaire désignée dans le corps", async () => {
      const { youngA, youngB } = await givenTwoYoungs();
      const targeted = await seedEquivalence(youngA);
      const foreign = await seedEquivalence(youngB);
      const foreignBefore = await snapshotEquivalence(foreign._id);
      const youngBBefore = await snapshotYoung(youngB._id);

      const res = await request(getAppHelper(youngA))
        .put(`/young/${youngA._id}/phase2/equivalence/${targeted._id}`)
        .send({ address: "Adresse corrigée", idEquivalence: foreign._id.toString(), id: youngB._id.toString() });

      expect(res.status).toEqual(200);
      expect((await snapshotEquivalence(targeted._id))?.address).toEqual("Adresse corrigée");
      expect(await snapshotEquivalence(foreign._id)).toEqual(foreignBefore);
      expect(await snapshotYoung(youngB._id)).toEqual(youngBBefore);
    });

    it("l'équivalence d'un autre volontaire visée par l'URL reste refusée, même si le corps désigne une équivalence du volontaire", async () => {
      const { youngA, youngB } = await givenTwoYoungs();
      const own = await seedEquivalence(youngA);
      const foreign = await seedEquivalence(youngB);
      const ownBefore = await snapshotEquivalence(own._id);
      const foreignBefore = await snapshotEquivalence(foreign._id);

      const res = await request(getAppHelper(youngA))
        .put(`/young/${youngA._id}/phase2/equivalence/${foreign._id}`)
        .send({ address: "Adresse corrigée", idEquivalence: own._id.toString(), id: youngA._id.toString() });

      expect(res.status).toEqual(403);
      expect(await snapshotEquivalence(own._id)).toEqual(ownBefore);
      expect(await snapshotEquivalence(foreign._id)).toEqual(foreignBefore);
    });

    it.each([[ROLES.REFERENT_DEPARTMENT], [ROLES.REFERENT_REGION]])(
      "un %s instruit l'équivalence de l'URL, pas celle d'un volontaire hors de son périmètre désignée dans le corps",
      async (role) => {
        const { youngA, youngB } = await givenTwoYoungs();
        const instructor = await actorOf(role);
        const targeted = await seedEquivalence(youngA);
        const foreign = await seedEquivalence(youngB);
        const foreignBefore = await snapshotEquivalence(foreign._id);
        const youngBBefore = await snapshotYoung(youngB._id);

        const res = await request(getAppHelper(instructor))
          .put(`/young/${youngA._id}/phase2/equivalence/${targeted._id}`)
          .send({ status: EQUIVALENCE_STATUS.VALIDATED, idEquivalence: foreign._id.toString(), id: youngB._id.toString() });

        expect(res.status).toEqual(200);
        expect((await snapshotEquivalence(targeted._id))?.status).toEqual(EQUIVALENCE_STATUS.VALIDATED);
        expect(await snapshotEquivalence(foreign._id)).toEqual(foreignBefore);
        expect(await snapshotYoung(youngB._id)).toEqual(youngBBefore);
      },
    );
  });

  describe("Routes de lecture et de suppression", () => {
    it("GET / ne liste que les équivalences du volontaire de l'URL, même avec un identifiant tiers dans la requête", async () => {
      const { youngA, youngB } = await givenTwoYoungs();
      const own = await seedEquivalence(youngA);
      await seedEquivalence(youngB);

      const res = await request(getAppHelper(youngA)).get(`/young/${youngA._id}/phase2/equivalence`).query({ id: youngB._id.toString() });

      expect(res.status).toEqual(200);
      expect(res.body.data.map((e: { _id: string }) => e._id)).toEqual([own._id.toString()]);
    });

    it("GET /:idEquivalence refuse l'équivalence d'un tiers visée par l'URL, même si la requête désigne celle du volontaire", async () => {
      const { youngA, youngB } = await givenTwoYoungs();
      const own = await seedEquivalence(youngA);
      const foreign = await seedEquivalence(youngB);

      const res = await request(getAppHelper(youngA))
        .get(`/young/${youngA._id}/phase2/equivalence/${foreign._id}`)
        .query({ id: youngA._id.toString(), idEquivalence: own._id.toString() });

      expect(res.status).toEqual(403);
      expect(res.body.data).toBeUndefined();
    });

    it("DELETE /:idEquivalence ne supprime que l'équivalence de l'URL, pas celle désignée par le corps", async () => {
      const { youngA, youngB } = await givenTwoYoungs();
      const targeted = await seedEquivalence(youngA, { files: [] });
      const foreign = await seedEquivalence(youngB);
      (listFiles as jest.Mock).mockResolvedValue([]);
      (deleteFilesByList as jest.Mock).mockResolvedValue({});

      const res = await request(getAppHelper(youngA))
        .delete(`/young/${youngA._id}/phase2/equivalence/${targeted._id}`)
        .send({ id: youngB._id.toString(), idEquivalence: foreign._id.toString() });

      expect(res.status).toEqual(200);
      expect(await snapshotEquivalence(targeted._id)).toBeNull();
      expect(await snapshotEquivalence(foreign._id)).not.toBeNull();
    });
  });

  describe("Non-régression : création et modification légitimes", () => {
    it("un volontaire crée sa propre équivalence, en attente de vérification", async () => {
      const { youngA } = await givenTwoYoungs();

      const res = await request(getAppHelper(youngA)).post(`/young/${youngA._id}/phase2/equivalence`).send(equivalenceBody());

      expect(res.status).toEqual(200);
      const forA = await equivalencesOf(youngA);
      expect(forA).toHaveLength(1);
      expect(forA[0]).toMatchObject({ youngId: youngA._id.toString(), status: EQUIVALENCE_STATUS.WAITING_VERIFICATION, type: "BAFA", structureName: "Structure du volontaire" });
      expect((await snapshotYoung(youngA._id))?.status_equivalence).toEqual(EQUIVALENCE_STATUS.WAITING_VERIFICATION);
    });

    it.each([[ROLES.REFERENT_DEPARTMENT], [ROLES.REFERENT_REGION], [ROLES.ADMIN]])("un %s dans son périmètre crée une équivalence validée de 84 h", async (role) => {
      const { youngA } = await givenTwoYoungs();
      const actor = await actorOf(role);

      const res = await request(getAppHelper(actor)).post(`/young/${youngA._id}/phase2/equivalence`).send(equivalenceBody());

      expect(res.status).toEqual(200);
      const forA = await equivalencesOf(youngA);
      expect(forA).toHaveLength(1);
      expect(forA[0]).toMatchObject({ youngId: youngA._id.toString(), status: EQUIVALENCE_STATUS.VALIDATED, missionDuration: 84 });
    });

    it("un volontaire modifie sa propre équivalence, qui repart en vérification", async () => {
      const { youngA } = await givenTwoYoungs();
      const own = await seedEquivalence(youngA, { status: EQUIVALENCE_STATUS.WAITING_CORRECTION });

      const res = await request(getAppHelper(youngA)).put(`/young/${youngA._id}/phase2/equivalence/${own._id}`).send({ address: "Adresse corrigée" });

      expect(res.status).toEqual(200);
      expect(await snapshotEquivalence(own._id)).toMatchObject({ address: "Adresse corrigée", status: EQUIVALENCE_STATUS.WAITING_VERIFICATION });
    });

    it.each([[ROLES.REFERENT_DEPARTMENT], [ROLES.REFERENT_REGION], [ROLES.ADMIN]])("un %s dans son périmètre change le statut d'une équivalence", async (role) => {
      const { youngA } = await givenTwoYoungs();
      const actor = await actorOf(role);
      const own = await seedEquivalence(youngA);

      const res = await request(getAppHelper(actor))
        .put(`/young/${youngA._id}/phase2/equivalence/${own._id}`)
        .send({ status: EQUIVALENCE_STATUS.REFUSED, message: "Pièces illisibles" });

      expect(res.status).toEqual(200);
      expect(await snapshotEquivalence(own._id)).toMatchObject({ status: EQUIVALENCE_STATUS.REFUSED });
      expect((await snapshotYoung(youngA._id))?.status_equivalence).toEqual(EQUIVALENCE_STATUS.REFUSED);
    });
  });
});
