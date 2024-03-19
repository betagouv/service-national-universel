require("dotenv").config({ path: "./.env-testing" });
const fetch = require("node-fetch");
const request = require("supertest");
const getAppHelper = require("./helpers/app");
const { dbConnect, dbClose } = require("./helpers/db");

const getNewClasseFixture = require("./fixtures/classe");
// referent
const { createReferentHelper } = require("./helpers/referent");
const getNewReferentFixture = require("./fixtures/referent");

describe("POST /", () => {
  let referent;
  const passport = require("passport");

  beforeAll(async () => {
    referent = await createReferentHelper(getNewReferentFixture());
    passport.user = referent;
  });

  afterAll(() => {
    passport.user = null;
  });

  it("should return 200 for valid invitation", async () => {
    const res = await request(getAppHelper()).post("/").send(getNewClasseFixture());
    expect(res.statusCode).toEqual(200);
    expect(res.body.ok).toEqual(true);
    expect(res.body.young).toBeDefined();
  });

  it("should return 400 for invalid input", async () => {
    const res = await request(getAppHelper()).post("/").send({});

    expect(res.statusCode).toEqual(400);
  });

  it("should return 403 when user is not authorized to invite", async () => {
    const unauthorizedReferent = { ...getNewReferentFixture(), role: "supervisor" };
    passport.user = unauthorizedReferent;

    const res = await request(getAppHelper()).post("/invite").send(getNewClasseFixture());
    expect(res.statusCode).toEqual(403);

    // Remettre le referent autorisé pour les autres tests
    passport.user = referent;
  });

  describe("PUT /:id", () => {
    let referent, classeData, updatedClasseData;

    beforeAll(async () => {
      referent = await createReferentHelper(getNewReferentFixture());
      classeData = await getNewClasseFixture();
      updatedClasseData = { ...classeData, name: "Updated Class Name" };
      //   await ClasseModel.create(classeData);
      passport.user = referent;
    });

    it("should update a class successfully", async () => {
      const res = await request(getAppHelper()).put(`/${classeData._id}`).send(updatedClasseData);

      expect(res.statusCode).toEqual(200);
      expect(res.body.ok).toEqual(true);
      expect(res.body.data.name).toEqual(updatedClasseData.name);
    });

    it("should return 400 for invalid input", async () => {
      const res = await request(getAppHelper()).put(`/${classeData._id}`).send({}); // Données invalides

      expect(res.statusCode).toEqual(400);
    });

    it("should return 403 when user is not authorized to update", async () => {
      const unauthorizedReferent = { ...getNewReferentFixture(), role: "supervisor" };
      passport.user = unauthorizedReferent;

      const res = await request(getAppHelper()).put(`/${classeData._id}`).send(updatedClasseData);
      expect(res.statusCode).toEqual(403);

      passport.user = referent;
    });

    it("should return 404 if class is not found", async () => {
      const res = await request(getAppHelper()).put(`/non-existing-id`).send(updatedClasseData);

      expect(res.statusCode).toEqual(404);
    });

    afterAll(dbClose);
  });

  describe("DELETE /:id", () => {
    let classe, referent;

    beforeAll(async () => {
      await dbConnect();
      classe = await ClasseModel.create(getNewClasseFixture());
      referent = await createReferentHelper(getNewReferentFixture());
    });

    it("should delete class successfully", async () => {
      const res = await request(getAppHelper()).delete(`/${classe._id}`).set("Authorization", `Bearer ${referent.token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.ok).toEqual(true);

      const deletedClasse = await ClasseModel.findById(classe._id);
      expect(deletedClasse).toBeNull();
    });

    it("should return 400 for invalid ID", async () => {
      const res = await request(getAppHelper()).delete(`/invalid-id`).set("Authorization", `Bearer ${referent.token}`);

      expect(res.statusCode).toEqual(400);
    });

    it("should return 404 if class not found", async () => {
      const res = await request(getAppHelper()).delete(`/non-existing-id`).set("Authorization", `Bearer ${referent.token}`);

      expect(res.statusCode).toEqual(404);
    });

    it("should return 403 when user is not authorized to delete", async () => {
      const unauthorizedReferent = await createReferentHelper({ ...getNewReferentFixture(), role: "otherRole" });
      const res = await request(getAppHelper()).delete(`/${classe._id}`).set("Authorization", `Bearer ${unauthorizedReferent.token}`);

      expect(res.statusCode).toEqual(403);
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    afterAll(async () => {
      await dbClose();
    });
  });
});
