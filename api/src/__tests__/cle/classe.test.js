const request = require("supertest");
const getAppHelper = require("../helpers/app");
//classe
const { createClasse } = require("../helpers/classe");
const { createFixtureClasse } = require("../fixtures/classe");
//etablissement
const { createFixtureEtablissement } = require("../fixtures/etablissement");
const { createEtablissement } = require("../helpers/etablissement");
const EtablissementModel = require("../../models/cle/etablissement");
//young
const getNewYoungFixture = require("../fixtures/young");
const { createYoungHelper } = require("../helpers/young");
const YoungModel = require("../../models/young");
//cohort
const getNewCohortFixture = require("../fixtures/cohort");
const { createCohortHelper } = require("../helpers/cohort");

const { ROLES } = require("snu-lib");
const passport = require("passport");
const { dbConnect, dbClose } = require("../helpers/db");
const { ObjectId } = require("mongoose").Types;

beforeAll(dbConnect);
afterAll(dbClose);

jest.mock("../../emails", () => ({
  emit: jest.fn(),
}));

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
