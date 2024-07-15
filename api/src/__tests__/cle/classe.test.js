const request = require("supertest");
const passport = require("passport");
const { ObjectId } = require("mongoose").Types;
const { dbConnect, dbClose } = require("../helpers/db");
const { mockEsClient } = require("../helpers/es");
const getAppHelper = require("../helpers/app");

const snuLib = require("snu-lib");
const { ROLES, SUB_ROLES, STATUS_CLASSE, SENDINBLUE_TEMPLATES } = require("snu-lib");

//classe
const { createClasse } = require("../helpers/classe");
const { createFixtureClasse } = require("../fixtures/classe");
//etablissement
const { createFixtureEtablissement } = require("../fixtures/etablissement");
const { createEtablissement } = require("../helpers/etablissement");
const { EtablissementModel } = require("../../models");
//young
const getNewYoungFixture = require("../fixtures/young");
const { createYoungHelper } = require("../helpers/young");
const { YoungModel } = require("../../models");
//cohort
const getNewCohortFixture = require("../fixtures/cohort");
const { createCohortHelper } = require("../helpers/cohort");
//referent
const { getNewReferentFixture } = require("../fixtures/referent");
const { createReferentHelper } = require("../helpers/referent");

beforeAll(dbConnect);
afterAll(dbClose);

mockEsClient({
  classe: [{ _id: "classeId", etablissementIds: ["etabId"], referentClasseIds: ["referentId"] }],
  etablissement: [{ _id: "etabId" }],
  referent: [{ _id: "referentId" }],
});

jest.mock("../../emails", () => ({
  emit: jest.fn(),
}));

const emailsEmitter = require("../../emails");

describe("DELETE /cle/classe/:id", () => {
  it("should return 400 when id is invalid", async () => {
    const res = await request(getAppHelper()).delete("/cle/classe/invalidId?type=delete");
    expect(res.status).toBe(400);
  });

  it("should return 400 when type is invalid", async () => {
    const classeId = new ObjectId();
    const res = await request(getAppHelper()).delete(`/cle/classe/${classeId}`).query({ type: "invalidType" }).send();
    expect(res.status).toBe(400);
  });

  it("should return 403 when type is withdraw and user cannot withdraw classes", async () => {
    const classeId = new ObjectId();
    passport.user.role = ROLES.RESPONSIBLE;
    const res = await request(getAppHelper()).delete(`/cle/classe/${classeId}`).query({ type: "withdraw" }).send();
    expect(res.status).toBe(403);
    passport.user.role = ROLES.ADMIN;
  });

  it("should return 403 when type is delete and user cannot delete classes", async () => {
    const classeId = new ObjectId();
    passport.user.role = ROLES.RESPONSIBLE;
    const res = await request(getAppHelper()).delete(`/cle/classe/${classeId}`).query({ type: "delete" }).send();
    expect(res.status).toBe(403);
    passport.user.role = ROLES.ADMIN;
  });

  it("should return 404 when class is not found", async () => {
    const nonExistingId = "104a49ba503555e4d8853003";
    const res = await request(getAppHelper()).delete(`/cle/classe/${nonExistingId}`).query({ type: "delete" }).send();
    expect(res.status).toBe(404);
  });

  it("should return 200 when class is deleted successfully", async () => {
    const classe = createFixtureClasse();
    const validId = (await createClasse(classe))._id;
    const res = await request(getAppHelper()).delete(`/cle/classe/${validId}`).query({ type: "delete" }).send();
    expect(res.status).toBe(200);
  });

  it("should return 200 when class is withdrawn successfully", async () => {
    const classe = createFixtureClasse();
    const validId = (await createClasse(classe))._id;
    const res = await request(getAppHelper()).delete(`/cle/classe/${validId}`).query({ type: "withdraw" }).send();
    expect(res.status).toBe(200);
  });
});

describe("PUT /cle/classe/:id", () => {
  it("should return 400 when id is invalid", async () => {
    const res = await request(getAppHelper()).put("/cle/classe/invalidId").send({ name: "New Class" });
    expect(res.status).toBe(400);
  });

  it("should return 400 when required fields are missing", async () => {
    const classeId = new ObjectId();
    const res = await request(getAppHelper()).put(`/cle/classe/${classeId}`).send({ name: "New Class" });
    expect(res.status).toBe(400);
  });

  it("should return 403 when user cannot update classes", async () => {
    const classe = createFixtureClasse();
    const validId = (await createClasse(classe))._id;
    passport.user.role = ROLES.RESPONSIBLE;
    const res = await request(getAppHelper())
      .put(`/cle/classe/${validId}`)
      .send({
        ...classe,
        name: "New Class",
      });
    expect(res.status).toBe(403);
    passport.user.role = ROLES.ADMIN;
  });

  it("should return 404 when class is not found", async () => {
    const nonExistingId = "104a49ba503555e4d8853003";
    const classe = createFixtureClasse();
    const res = await request(getAppHelper())
      .put(`/cle/classe/${nonExistingId}`)
      .send({
        ...classe,
        name: "New Class",
      });
    expect(res.status).toBe(404);
  });

  it("should return 403 when REFERENT_CLASSE tries to update a class they don't manage", async () => {
    const classe = createFixtureClasse();
    const validId = (await createClasse(classe))._id;
    passport.user.role = ROLES.REFERENT_CLASSE;
    passport.user._id = new ObjectId();
    const res = await request(getAppHelper())
      .put(`/cle/classe/${validId}`)
      .send({
        ...classe,
        name: "New Class",
      });
    expect(res.status).toBe(403);
    passport.user.role = ROLES.ADMIN;
  });

  it("should return 404 when the associated etablissement does not exist", async () => {
    const userId = new ObjectId();
    const classe = createFixtureClasse({ etablissementId: new ObjectId() });
    const validId = (await createClasse(classe))._id;
    passport.user.role = ROLES.ADMINISTRATEUR_CLE;
    passport.user._id = userId;
    jest.spyOn(EtablissementModel, "findById").mockResolvedValueOnce(null);
    const res = await request(getAppHelper())
      .put(`/cle/classe/${validId}`)
      .send({
        ...classe,
        name: "Updated Class",
      });
    expect(res.status).toBe(404);
    passport.user.role = ROLES.ADMIN;
  });

  it("should return 403 when ADMINISTRATEUR_CLE is both referent and coordinateur", async () => {
    const userId = new ObjectId();
    const etablissement = createFixtureEtablissement({ referentEtablissementIds: [userId], coordinateurIds: [userId] });
    const etablissementId = (await createEtablissement(etablissement))._id;
    const classe = createFixtureClasse({ etablissementId: etablissementId });
    const validId = (await createClasse(classe))._id;
    const previous = passport.user._id;
    passport.user.role = ROLES.ADMINISTRATEUR_CLE;
    passport.user._id = userId;
    jest.spyOn(EtablissementModel, "findById").mockResolvedValueOnce(etablissement);
    const res = await request(getAppHelper())
      .put(`/cle/classe/${validId}`)
      .send({
        ...classe,
        name: "Updated Class",
      });
    expect(res.status).toBe(403);
    passport.user.role = ROLES.ADMIN;
    passport.user._id = previous;
  });

  it("should return 404 when user try to change cohort that doesn't exist", async () => {
    const classe = createFixtureClasse();
    const validId = (await createClasse(classe))._id;
    const res = await request(getAppHelper())
      .put(`/cle/classe/${validId}`)
      .send({
        ...classe,
        cohort: "New Cohort",
      });
    expect(res.status).toBe(404);
  });

  it("should return 403 when user cannot update the cohort", async () => {
    passport.user.role = ROLES.ADMINISTRATEUR_CLE;
    const cohort = await createCohortHelper(getNewCohortFixture({ name: "CLE juin 2024" }));
    const userId = new ObjectId();
    const etablissement = createFixtureEtablissement({ referentEtablissementIds: [userId] });
    const etablissementId = (await createEtablissement(etablissement))._id;
    const classe = createFixtureClasse({ etablissementId: etablissementId });
    const validId = (await createClasse(classe))._id;
    jest.spyOn(EtablissementModel, "findById").mockResolvedValueOnce(etablissement);
    const res = await request(getAppHelper())
      .put(`/cle/classe/${validId}`)
      .send({
        ...classe,
        cohort: cohort.name,
      });
    expect(res.status).toBe(403);
    passport.user.role = ROLES.ADMIN;
  });

  it("should return 403 when changing cohort is not allowed because young has validate his Phase1", async () => {
    const cohort = await createCohortHelper(getNewCohortFixture());
    const classe = createFixtureClasse({});
    const validId = (await createClasse(classe))._id;
    const young = getNewYoungFixture({ classeId: validId, statusPhase1: "DONE" });
    await createYoungHelper(young);

    const res = await request(getAppHelper())
      .put(`/cle/classe/${validId}`)
      .send({
        ...classe,
        cohort: cohort.name,
      });

    expect(res.status).toBe(403);
  });

  it("should return 403 when user can't edit estimatedSeats", async () => {
    const classe = createFixtureClasse({ estimatedSeats: 5 });
    const validId = (await createClasse(classe))._id;
    passport.user.role = ROLES.RESPONSIBLE;
    const res = await request(getAppHelper())
      .put(`/cle/classe/${validId}`)
      .send({
        ...classe,
        estimatedSeats: 10,
      });
    expect(res.status).toBe(403);
    passport.user.role = ROLES.ADMIN;
  });

  it("should send mail if value.estimatedSeats > classe.estimatedSeats", async () => {
    const classeFixture = createFixtureClasse({ estimatedSeats: 5, totalSeats: 5 });
    const classe = await createClasse(classeFixture);
    const res = await request(getAppHelper())
      .put(`/cle/classe/${classe._id}`)
      .send({
        ...classeFixture,
        estimatedSeats: 10,
      });
    expect(res.status).toBe(200);
    expect(emailsEmitter.emit).toHaveBeenCalledWith(
      SENDINBLUE_TEMPLATES.CLE.CLASSE_INCREASE_OBJECTIVE,
      expect.objectContaining({
        estimatedSeats: 10,
        totalSeats: 10,
        _id: classe._id,
      }),
    );
  });

  it("should updte totalSeats when estimatedSeats change and date < LIMIT_DATE_ESTIMATED_SEATS", async () => {
    const classe = createFixtureClasse({ estimatedSeats: 5, totalSeats: 5 });
    const validId = (await createClasse(classe))._id;
    const res = await request(getAppHelper())
      .put(`/cle/classe/${validId}`)
      .send({
        ...classe,
        estimatedSeats: 10,
      });
    expect(res.status).toBe(200);
    expect(res.body.data.totalSeats).toBe(10);
  });

  it("should return 403 when user can't edit totalSeats", async () => {
    const classe = createFixtureClasse({ totalSeats: 5 });
    const validId = (await createClasse(classe))._id;
    passport.user.role = ROLES.RESPONSIBLE;
    const res = await request(getAppHelper())
      .put(`/cle/classe/${validId}`)
      .send({
        ...classe,
        totalSeats: 10,
      });
    expect(res.status).toBe(403);
    passport.user.role = ROLES.ADMIN;
  });

  it("should return 400 when totalSeats > estimatedSeats", async () => {
    const classe = createFixtureClasse({ estimatedSeats: 1, totalSeats: 1 });
    const validId = (await createClasse(classe))._id;
    jest.spyOn(snuLib, "canEditTotalSeats").mockReturnValueOnce(true);
    const res = await request(getAppHelper())
      .put(`/cle/classe/${validId}`)
      .send({
        ...classe,
        totalSeats: 10,
      });
    expect(res.status).toBe(400);
  });

  it("should return 403 when changing cohort is not allowed because classe has a ligneID", async () => {
    const cohort = await createCohortHelper(getNewCohortFixture());
    const classe = createFixtureClasse({ ligneId: "1234" });
    const validId = (await createClasse(classe))._id;

    const res = await request(getAppHelper())
      .put(`/cle/classe/${validId}`)
      .send({
        ...classe,
        cohort: cohort.name,
      });

    expect(res.status).toBe(403);
  });

  it("should return 200 when class is updated successfully", async () => {
    const classe = createFixtureClasse();
    const validId = (await createClasse(classe))._id;

    const res = await request(getAppHelper())
      .put(`/cle/classe/${validId}`)
      .send({
        ...classe,
        name: "New Class",
      });

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe("New Class");
  });

  it("should return 200 when class cohort is updated and related youngs are updated", async () => {
    const cohort = await createCohortHelper(getNewCohortFixture({ name: "CLE juin 2024" }));
    const classe = createFixtureClasse({});
    const validId = (await createClasse(classe))._id;
    const young = getNewYoungFixture({ classeId: validId, cohort: "CLE mai 2024" });
    await createYoungHelper(young);

    const res = await request(getAppHelper())
      .put(`/cle/classe/${validId}`)
      .send({
        ...classe,
        cohort: cohort.name,
      });
    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe(classe.name);

    const updatedYoungs = await YoungModel.find({ classeId: validId });
    updatedYoungs.forEach((y) => {
      expect(y.cohort).toBe(cohort.name);
      expect(y.sessionPhase1Id).toBeUndefined();
      expect(y.cohesionCenterId).toBeUndefined();
      expect(y.meetingPointId).toBeUndefined();
    });
  });
});

describe("PUT /cle/classe/:id/verify", () => {
  it("should return 400 when id is invalid", async () => {
    const res = await request(getAppHelper()).put("/cle/classe/invalidId/verify").send({ name: "New Class" });
    expect(res.status).toBe(400);
  });

  it("should return 400 when required fields are missing", async () => {
    const classeId = new ObjectId();
    const res = await request(getAppHelper()).put(`/cle/classe/${classeId}/verify`).send({ name: "New Class" });
    expect(res.status).toBe(400);
  });

  it("should return 403 when user cannot verify classes", async () => {
    const classe = createFixtureClasse();
    const validId = (await createClasse(classe))._id;
    passport.user.role = ROLES.RESPONSIBLE;
    const res = await request(getAppHelper())
      .put(`/cle/classe/${validId}/verify`)
      .send({
        ...classe,
      });
    expect(res.status).toBe(403);
    passport.user.role = ROLES.ADMIN;
  });

  it("should return 404 when class is not found", async () => {
    const nonExistingId = "104a49ba503555e4d8853003";
    const classe = createFixtureClasse();
    const res = await request(getAppHelper())
      .put(`/cle/classe/${nonExistingId}/verify`)
      .send({
        ...classe,
      });
    expect(res.status).toBe(404);
  });

  it("should return 404 when class doesn't have a referent_classe", async () => {
    const classe = createFixtureClasse();
    const validId = (await createClasse(classe))._id;
    const res = await request(getAppHelper())
      .put(`/cle/classe/${validId}/verify`)
      .send({
        ...classe,
      });
    expect(res.status).toBe(404);
  });

  it("should return 404 when the associated etablissement does not exist", async () => {
    const referentId = (await createReferentHelper(getNewReferentFixture({ role: ROLES.REFERENT_CLASSE })))._id;
    const classe = createFixtureClasse({ etablissementId: new ObjectId(), referentClasseIds: [referentId] });
    const validId = (await createClasse(classe))._id;
    passport.user.role = ROLES.ADMINISTRATEUR_CLE;
    passport.user.subRole = SUB_ROLES.referent_etablissement;
    passport.user._id = new ObjectId();
    jest.spyOn(EtablissementModel, "findById").mockResolvedValueOnce(null);
    const res = await request(getAppHelper())
      .put(`/cle/classe/${validId}/verify`)
      .send({
        ...classe,
      });
    expect(res.status).toBe(404);
    passport.user.role = ROLES.ADMIN;
  });

  it("should return 403 when REFERENT_ETABLISSEMENT tries to verify a class they don't manage", async () => {
    const referentId = (await createReferentHelper(getNewReferentFixture({ role: ROLES.REFERENT_CLASSE })))._id;
    const etablissementId = (await createEtablissement(createFixtureEtablissement()))._id;
    const classe = createFixtureClasse({ etablissementId: etablissementId, referentClasseIds: [referentId] });
    const validId = (await createClasse(classe))._id;
    passport.user.role = ROLES.ADMINISTRATEUR_CLE;
    const previous = passport.user.subRole;
    passport.user.subRole = SUB_ROLES.referent_etablissement;
    const res = await request(getAppHelper())
      .put(`/cle/classe/${validId}/verify`)
      .send({
        ...classe,
      });
    expect(res.status).toBe(403);
    passport.user.role = ROLES.ADMIN;
    passport.user.subRole = previous;
  });

  it("should return 403 when REFERENT_DEPARTMENT tries to verify a class they don't manage", async () => {
    const referentId = (await createReferentHelper(getNewReferentFixture({ role: ROLES.REFERENT_CLASSE })))._id;
    const classe = createFixtureClasse({ referentClasseIds: [referentId], department: "Nord" });
    const validId = (await createClasse(classe))._id;
    passport.user.role = ROLES.REFERENT_DEPARTMENT;
    const previous = passport.user.departement;
    passport.user.departement = "Loire";
    const res = await request(getAppHelper())
      .put(`/cle/classe/${validId}/verify`)
      .send({
        ...classe,
      });
    expect(res.status).toBe(403);
    passport.user.role = ROLES.ADMIN;
    passport.user.departement = previous;
  });

  it("should return 403 when REFERENT_REGION tries to verify a class they don't manage", async () => {
    const referentId = (await createReferentHelper(getNewReferentFixture({ role: ROLES.REFERENT_CLASSE })))._id;
    const classe = createFixtureClasse({ referentClasseIds: [referentId], region: "Normandie" });
    const validId = (await createClasse(classe))._id;
    passport.user.role = ROLES.REFERENT_REGION;
    const previous = passport.user.region;
    passport.user.region = "Bretagne";
    const res = await request(getAppHelper())
      .put(`/cle/classe/${validId}/verify`)
      .send({
        ...classe,
      });
    expect(res.status).toBe(403);
    passport.user.role = ROLES.ADMIN;
    passport.user.region = previous;
  });

  it("should return 200 when class is updated successfully", async () => {
    const referentId = (await createReferentHelper(getNewReferentFixture({ role: ROLES.REFERENT_CLASSE })))._id;
    const classe = createFixtureClasse({ referentClasseIds: [referentId] });
    const validId = (await createClasse(classe))._id;

    const res = await request(getAppHelper())
      .put(`/cle/classe/${validId}/verify`)
      .send({
        ...classe,
      });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe(STATUS_CLASSE.VERIFIED);
  });
});

describe("GET /:id/notifyRef", () => {
  it("should return 400 when id is invalid", async () => {
    const res = await request(getAppHelper()).get("/cle/classe/invalidId/notifyRef");
    expect(res.status).toBe(400);
  });

  it("should return 403 when user cannot notify admin", async () => {
    passport.user.role = ROLES.RESPONSIBLE;
    const classeId = new ObjectId();
    const res = await request(getAppHelper()).get(`/cle/classe/${classeId}/notifyRef`);
    expect(res.status).toBe(403);
    passport.user.role = ROLES.ADMIN;
  });

  it("should return 404 when class is not found", async () => {
    const nonExistingId = "104a49ba503555e4d8853003";
    const res = await request(getAppHelper()).get(`/cle/classe/${nonExistingId}/notifyRef`);
    expect(res.status).toBe(404);
  });

  it("should return 403 when REFERENT_REGION tries to notify a class they don't manage", async () => {
    const etablissementId = (await createEtablissement(createFixtureEtablissement()))._id;
    const classe = createFixtureClasse({ etablissementId: etablissementId, region: "Normandie" });
    const validId = (await createClasse(classe))._id;
    passport.user.role = ROLES.REFERENT_REGION;
    passport.user.region = "Bretagne";
    const res = await request(getAppHelper()).get(`/cle/classe/${validId}/notifyRef`);
    expect(res.status).toBe(403);
    passport.user.role = ROLES.ADMIN;
  });

  it("should return 403 when REFERENT_DEPARTMENT tries to notify a class they don't manage", async () => {
    const etablissementId = (await createEtablissement(createFixtureEtablissement()))._id;
    const classe = createFixtureClasse({ etablissementId: etablissementId, department: "Nord" });
    const validId = (await createClasse(classe))._id;
    passport.user.role = ROLES.REFERENT_DEPARTMENT;
    passport.user.departement = "Loire";
    const res = await request(getAppHelper()).get(`/cle/classe/${validId}/notifyRef`);
    expect(res.status).toBe(403);
    passport.user.role = ROLES.ADMIN;
  });

  it("should return 200 when referents are notified successfully", async () => {
    const etablissementId = (await createEtablissement(createFixtureEtablissement()))._id;
    const classe = createFixtureClasse({ etablissementId: etablissementId });
    const validId = (await createClasse(classe))._id;

    const res = await request(getAppHelper()).get(`/cle/classe/${validId}/notifyRef`);

    expect(res.status).toBe(200);
  });
});

describe("POST /elasticsearch/cle/classe/export", () => {
  it("should return 403 when user is not admin", async () => {
    passport.user.role = ROLES.RESPONSIBLE;
    const res = await request(getAppHelper()).post("/elasticsearch/cle/classe/export").send();
    expect(res.status).toBe(403);
    passport.user.role = ROLES.ADMIN;
  });
  it("should return 200 when export is successful", async () => {
    const res = await request(getAppHelper())
      .post("/elasticsearch/cle/classe/export")
      .send({ filters: {}, exportFields: ["name", "uniqueKeyAndId"] });
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
  });
});

describe("POST /elasticsearch/cle/etablissement/export", () => {
  it("should return 403 when user is not admin", async () => {
    passport.user.role = ROLES.RESPONSIBLE;
    const res = await request(getAppHelper()).post("/elasticsearch/cle/etablissement/export").send();
    expect(res.status).toBe(403);
    passport.user.role = ROLES.ADMIN;
  });
  it("should return 200 when export is successful", async () => {
    const res = await request(getAppHelper())
      .post("/elasticsearch/cle/etablissement/export")
      .send({ filters: {}, exportFields: ["name", "uai"] });
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
  });
});
