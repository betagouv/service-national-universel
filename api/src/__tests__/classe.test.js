const request = require("supertest");
const getAppHelper = require("./helpers/app");
const { createClasse } = require("./helpers/classe");
const { createFixtureClasse } = require("./fixtures/classe");
const getNewYoungFixture = require("./fixtures/young");
const { createYoungHelper } = require("./helpers/young");
const { ROLES } = require("snu-lib");
const passport = require("passport");
const { dbConnect, dbClose } = require("./helpers/db");
const { ObjectId } = require("mongoose").Types;
const YoungModel = require("../models/young");

beforeAll(dbConnect);
afterAll(dbClose);

jest.mock("../emails", () => ({
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
    const classeId = new ObjectId();
    passport.user.role = ROLES.RESPONSIBLE;
    const res = await request(getAppHelper()).put(`/cle/classe/${classeId}`).send({
      id: classeId,
      cohort: "CLE mai 2024",
      coloration: "SPORT",
      filiere: "Générale et technologique",
      grade: "4eme",
      name: "Douze",
      totalSeats: 4,
    });
    expect(res.status).toBe(403);
    passport.user.role = ROLES.ADMIN;
  });

  it("should return 404 when class is not found", async () => {
    const nonExistingId = "104a49ba503555e4d8853003";
    const res = await request(getAppHelper()).put(`/cle/classe/${nonExistingId}`).send({
      id: "104a49ba503555e4d8853003",
      cohort: "CLE mai 2024",
      coloration: "SPORT",
      filiere: "Générale et technologique",
      grade: "4eme",
      name: "Douze",
      totalSeats: 4,
    });
    expect(res.status).toBe(404);
  });

  it("should return 403 when changing cohort is not allowed because  young has validate his Phase1", async () => {
    const classe = createFixtureClasse();
    classe.cohort = "2022";
    const validId = (await createClasse(classe))._id;
    const young = getNewYoungFixture({ classeId: validId, statusPhase1: "DONE" });
    await createYoungHelper(young);

    const res = await request(getAppHelper()).put(`/cle/classe/${validId}`).send({
      id: validId,
      cohort: "2023",
      coloration: classe.coloration,
      filiere: classe.filiere,
      grade: classe.grade,
      name: classe.name,
      totalSeats: classe.totalSeats,
    });

    expect(res.status).toBe(403);
  });

  it("should return 403 when changing cohort is not allowed because classe has a ligneID", async () => {
    const classe = createFixtureClasse({ ligneId: "1234" });
    classe.cohort = "2022";
    const validId = (await createClasse(classe))._id;

    const res = await request(getAppHelper()).put(`/cle/classe/${validId}`).send({
      id: validId,
      cohort: "2023",
      coloration: classe.coloration,
      filiere: classe.filiere,
      grade: classe.grade,
      name: classe.name,
      totalSeats: classe.totalSeats,
    });

    expect(res.status).toBe(403);
  });

  it("should return 200 when class is updated successfully", async () => {
    const classe = createFixtureClasse();
    const validId = (await createClasse(classe))._id;

    const res = await request(getAppHelper()).put(`/cle/classe/${validId}`).send({
      id: validId,
      cohort: "2023",
      coloration: classe.coloration,
      filiere: classe.filiere,
      grade: classe.grade,
      name: classe.name,
      totalSeats: classe.totalSeats,
    });

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe(classe.name);
  });

  it("should return 200 when class cohort is updated and related youngs are updated", async () => {
    passport.user.role = ROLES.ADMIN;
    const classe = createFixtureClasse();
    const validId = (await createClasse(classe))._id;
    const young = getNewYoungFixture({ classeId: validId });
    await createYoungHelper(young);

    const res = await request(getAppHelper()).put(`/cle/classe/${validId}`).send({
      id: validId,
      cohort: "CLE juin 2024",
      coloration: classe.coloration,
      filiere: classe.filiere,
      grade: classe.grade,
      name: classe.name,
      totalSeats: classe.totalSeats,
    });
    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe(classe.name);

    const updatedYoungs = await YoungModel.find({ classeId: validId });
    updatedYoungs.forEach((y) => {
      expect(y.cohort).toBe("CLE juin 2024");
      expect(y.sessionPhase1Id).toBeUndefined();
      expect(y.cohesionCenterId).toBeUndefined();
      expect(y.meetingPointId).toBeUndefined();
    });
  });
});
