/**
 * Lot H2 de l'audit sécurité du 21/09/2026 : statuts et drapeaux que le volontaire fixait lui-même
 * (M41, M44, M45, M49, L24) et actions de masse phase 1 sans rattachement de la session (M50).
 * Les routes phase 1 (M49, M50) ont été supprimées le 2026-09-24 : voir phase1-ecritures-supprimees.test.ts.
 */
import request from "supertest";
import { addDays, addYears } from "date-fns";
import { YOUNG_STATUS, YOUNG_STATUS_PHASE1, YOUNG_STATUS_PHASE3 } from "snu-lib";

import { getAppHelperWithAcl, resetAppAuth } from "./helpers/app";
import { dbConnect, dbClose } from "./helpers/db";
import getNewYoungFixture from "./fixtures/young";
import { createYoungHelper, getYoungByIdHelper } from "./helpers/young";
import { createCohortHelper } from "./helpers/cohort";
import getNewCohortFixture from "./fixtures/cohort";

jest.mock("../brevo", () => ({
  ...jest.requireActual("../brevo"),
  sendEmail: () => Promise.resolve(),
  sendTemplate: jest.fn(() => Promise.resolve()),
  sync: () => Promise.resolve(),
  unsync: () => Promise.resolve(),
}));

jest.mock("../geo", () => ({
  ...jest.requireActual("../geo"),
  getQPV: () => Promise.resolve(undefined),
  getDensity: () => Promise.resolve(undefined),
}));

jest.mock("../utils", () => ({
  ...jest.requireActual("../utils"),
  notifDepartmentChange: () => Promise.resolve(),
}));

beforeAll(async () => {
  await dbConnect(__filename.slice(__dirname.length + 1, -3));
});
afterAll(dbClose);
afterEach(resetAppAuth);

describe("PUT /young/account/address (M41)", () => {
  const newAddress = (department: string) => ({
    addressVerified: "true",
    country: "France",
    city: "Lyon",
    zip: "69001",
    address: "1 rue de la République",
    department,
    region: "Auvergne-Rhône-Alpes",
  });

  async function createEligibleCohort(department: string) {
    return createCohortHelper(
      getNewCohortFixture({
        inscriptionStartDate: addDays(new Date(), -10),
        inscriptionEndDate: addDays(new Date(), 10),
        eligibility: {
          zones: [department],
          schoolLevels: ["2ndeGT"],
          bornAfter: addYears(new Date(), -30),
          bornBefore: addYears(new Date(), 1),
        },
      }),
    );
  }

  it("ne promeut pas en VALIDATED un jeune en liste complémentaire qui l'envoie avec sa nouvelle adresse", async () => {
    const cohort = await createEligibleCohort("Rhône");
    const young = await createYoungHelper(
      getNewYoungFixture({
        department: "Ain",
        source: "VOLONTAIRE",
        grade: "2ndeGT",
        status: YOUNG_STATUS.WAITING_LIST,
        statusPhase1: YOUNG_STATUS_PHASE1.WAITING_AFFECTATION,
        cohort: cohort.name,
        cohortId: cohort._id.toString(),
      }),
    );

    const res = await request(await getAppHelperWithAcl(young))
      .put("/young/account/address")
      .send({ ...newAddress("Rhône"), status: YOUNG_STATUS.VALIDATED, cohort: "une autre cohorte" });

    expect(res.status).toBe(200);
    const updated = await getYoungByIdHelper(young._id);
    expect(updated?.department).toBe("Rhône");
    expect(updated?.status).toBe(YOUNG_STATUS.WAITING_LIST);
    expect(updated?.cohort).toBe(cohort.name);
  });

  it("passe le jeune en NOT_ELIGIBLE, côté serveur, si aucun séjour n'est ouvert à sa nouvelle adresse", async () => {
    const cohort = await createEligibleCohort("Ain");
    const young = await createYoungHelper(
      getNewYoungFixture({
        department: "Ain",
        source: "VOLONTAIRE",
        grade: "2ndeGT",
        status: YOUNG_STATUS.VALIDATED,
        statusPhase1: YOUNG_STATUS_PHASE1.WAITING_AFFECTATION,
        cohort: cohort.name,
        cohortId: cohort._id.toString(),
      }),
    );

    const res = await request(await getAppHelperWithAcl(young))
      .put("/young/account/address")
      .send({ ...newAddress("Nord"), status: YOUNG_STATUS.VALIDATED });

    expect(res.status).toBe(200);
    const updated = await getYoungByIdHelper(young._id);
    expect(updated?.status).toBe(YOUNG_STATUS.NOT_ELIGIBLE);
  });

  it("ignore le statut envoyé quand le département ne change pas", async () => {
    const young = await createYoungHelper(getNewYoungFixture({ department: "Ain", status: YOUNG_STATUS.WAITING_LIST, statusPhase1: YOUNG_STATUS_PHASE1.WAITING_AFFECTATION }));

    const res = await request(await getAppHelperWithAcl(young))
      .put("/young/account/address")
      .send({ ...newAddress("Ain"), status: YOUNG_STATUS.VALIDATED });

    expect(res.status).toBe(200);
    const updated = await getYoungByIdHelper(young._id);
    expect(updated?.status).toBe(YOUNG_STATUS.WAITING_LIST);
  });
});

describe("validation de la phase 3 par le tuteur (M44)", () => {
  it("GET /young/validate_phase3 ne renvoie au porteur du lien que la vue tuteur", async () => {
    const token = `token-${Date.now()}`;
    const young = await createYoungHelper(getNewYoungFixture({ phase3Token: token, phase3StructureName: "Association", statusPhase3: YOUNG_STATUS_PHASE3.WAITING_VALIDATION }));

    const res = await request(await getAppHelperWithAcl()).get(`/young/validate_phase3/${young._id}/${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.firstName).toBe(young.firstName);
    expect(res.body.data.phase3StructureName).toBe("Association");
    for (const field of ["email", "phone", "address", "parent1Email", "parent1Phone", "handicap", "phase3Token", "imageRightFiles", "birthdateAt"]) {
      expect(res.body.data).not.toHaveProperty(field);
    }
  });

  it("PUT /young/validate_phase3 n'écrit que le statut et la note du tuteur", async () => {
    const token = `token-${Date.now()}`;
    const young = await createYoungHelper(getNewYoungFixture({ phase3Token: token, status: YOUNG_STATUS.VALIDATED, statusPhase3: YOUNG_STATUS_PHASE3.WAITING_VALIDATION }));

    const res = await request(await getAppHelperWithAcl())
      .put(`/young/validate_phase3/${young._id}/${token}`)
      .send({ phase3TutorNote: "RAS", phase3MissionDescription: "réécrite", status: YOUNG_STATUS.WITHDRAWN });

    expect(res.status).toBe(200);
    expect(res.body.data).not.toHaveProperty("email");
    const updated = await getYoungByIdHelper(young._id);
    expect(updated?.statusPhase3).toBe(YOUNG_STATUS_PHASE3.VALIDATED);
    expect(updated?.phase3TutorNote).toBe("RAS");
    expect(updated?.phase3MissionDescription).toBe(young.phase3MissionDescription);
    expect(updated?.status).toBe(YOUNG_STATUS.VALIDATED);
  });

  it("efface le jeton à la validation : le lien du tuteur ne sert qu'une fois", async () => {
    const token = `token-${Date.now()}`;
    const young = await createYoungHelper(getNewYoungFixture({ phase3Token: token, statusPhase3: YOUNG_STATUS_PHASE3.WAITING_VALIDATION }));

    const validation = await request(await getAppHelperWithAcl())
      .put(`/young/validate_phase3/${young._id}/${token}`)
      .send({ phase3TutorNote: "RAS" });
    expect(validation.status).toBe(200);
    expect((await getYoungByIdHelper(young._id))?.phase3Token).toBe("");

    const relecture = await request(await getAppHelperWithAcl()).get(`/young/validate_phase3/${young._id}/${token}`);
    expect(relecture.status).toBe(404);

    const revalidation = await request(await getAppHelperWithAcl())
      .put(`/young/validate_phase3/${young._id}/${token}`)
      .send({ phase3TutorNote: "réécrite" });
    expect(revalidation.status).toBe(404);
    expect((await getYoungByIdHelper(young._id))?.phase3TutorNote).toBe("RAS");
  });
});

describe("PUT /young/:id/validate-mission-phase3 (M45)", () => {
  it("ignore le statusPhase3 envoyé par le jeune et fixe WAITING_VALIDATION", async () => {
    const young = await createYoungHelper(getNewYoungFixture({ statusPhase3: YOUNG_STATUS_PHASE3.WAITING_REALISATION }));

    const res = await request(await getAppHelperWithAcl(young))
      .put(`/young/${young._id}/validate-mission-phase3`)
      .send({ phase3StructureName: "Association", phase3TutorEmail: "tuteur@example.org", statusPhase3: YOUNG_STATUS_PHASE3.VALIDATED });

    expect(res.status).toBe(200);
    const updated = await getYoungByIdHelper(young._id);
    expect(updated?.statusPhase3).toBe(YOUNG_STATUS_PHASE3.WAITING_VALIDATION);
    expect(updated?.phase3StructureName).toBe("Association");
  });

  it("n'écrit aucun champ hors du formulaire phase 3", async () => {
    const young = await createYoungHelper(getNewYoungFixture({ status: YOUNG_STATUS.WAITING_LIST, statusPhase3: YOUNG_STATUS_PHASE3.WAITING_REALISATION }));

    const res = await request(await getAppHelperWithAcl(young))
      .put(`/young/${young._id}/validate-mission-phase3`)
      .send({ phase3TutorEmail: "tuteur@example.org", status: YOUNG_STATUS.VALIDATED, imageRight: "true" });

    expect(res.status).toBe(200);
    const updated = await getYoungByIdHelper(young._id);
    expect(updated?.status).toBe(YOUNG_STATUS.WAITING_LIST);
    expect(updated?.imageRight).toBe(young.imageRight);
  });

  it("refuse un email de tuteur invalide", async () => {
    const young = await createYoungHelper(getNewYoungFixture({ statusPhase3: YOUNG_STATUS_PHASE3.WAITING_REALISATION }));

    const res = await request(await getAppHelperWithAcl(young))
      .put(`/young/${young._id}/validate-mission-phase3`)
      .send({ phase3TutorEmail: "pas-un-email" });

    expect(res.status).toBe(400);
  });

  it("refuse de réécrire une mission déjà validée", async () => {
    const young = await createYoungHelper(getNewYoungFixture({ statusPhase3: YOUNG_STATUS_PHASE3.VALIDATED, phase3StructureName: "Attestée" }));

    const res = await request(await getAppHelperWithAcl(young))
      .put(`/young/${young._id}/validate-mission-phase3`)
      .send({ phase3StructureName: "Autre", phase3TutorEmail: "tuteur@example.org" });

    expect(res.status).toBe(403);
    const updated = await getYoungByIdHelper(young._id);
    expect(updated?.phase3StructureName).toBe("Attestée");
  });
});
