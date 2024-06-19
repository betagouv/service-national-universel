const request = require("supertest");
const getAppHelper = require("./helpers/app");
const { createEtablissement } = require("./helpers/etablissement");
const { createFixtureEtablissement } = require("./fixtures/etablissement");
const { createClasse } = require("./helpers/classe");
const { createFixtureClasse } = require("./fixtures/classe");
const { ROLES } = require("snu-lib");
const passport = require("passport");
const { dbConnect, dbClose } = require("./helpers/db");
const { ObjectId } = require("mongoose").Types;
const { CleClasseModel } = require("../models");

beforeAll(dbConnect);
afterAll(dbClose);

describe("PUT /cle/etablissement/:id", () => {
  it("should return 400 when id is invalid", async () => {
    const res = await request(getAppHelper()).put("/cle/etablissement/invalidId").send({ name: "New Etablissement" });
    expect(res.status).toBe(400);
  });

  it("should return 400 when required fields are missing", async () => {
    const etablissementId = new ObjectId();
    const res = await request(getAppHelper()).put(`/cle/etablissement/${etablissementId}`).send({ name: "New Etablissement" });
    expect(res.status).toBe(400);
  });

  it("should return 403 when user cannot update etablissement", async () => {
    const etablissementId = new ObjectId();
    passport.user.role = ROLES.RESPONSIBLE;
    const res = await request(getAppHelper())
      .put(`/cle/etablissement/${etablissementId}`)
      .send({
        id: etablissementId,
        name: "New Etablissement",
        address: "12 rue de la paix",
        zip: "75000",
        city: "Paris",
        department: "75",
        region: "Ile de France",
        academy: "Paris",
        state: "inactive",
        schoolYears: ["2023-2024"],
        type: ["Lycée Général"],
        sector: ["Statut public"],
      });
    expect(res.status).toBe(403);
    passport.user.role = ROLES.ADMIN;
  });

  it("should return 404 when etablissement is not found", async () => {
    const nonExistingId = "104a49ba503555e4d8853003";
    const res = await request(getAppHelper())
      .put(`/cle/etablissement/${nonExistingId}`)
      .send({
        id: "104a49ba503555e4d8853003",
        name: "New Etablissement",
        address: "12 rue de la paix",
        zip: "75000",
        city: "Paris",
        department: "75",
        region: "Ile de France",
        academy: "Paris",
        state: "inactive",
        schoolYears: ["2023-2024"],
        type: ["Lycée Général"],
        sector: ["Statut public"],
      });
    expect(res.status).toBe(404);
  });

  it("should return 200 when etablissement is updated successfully", async () => {
    const etablissement = createFixtureEtablissement();
    const validId = (await createEtablissement(etablissement))._id;

    const res = await request(getAppHelper())
      .put(`/cle/etablissement/${validId}`)
      .send({
        ...etablissement,
        state: "inactive",
      });

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe(etablissement.name);
    expect(res.body.data.state).toBe("inactive");
  });

  it("should update academy when department is updated", async () => {
    const etablissement = createFixtureEtablissement({ department: "Paris", region: "Ile de france", academy: "Paris" });
    const validId = (await createEtablissement(etablissement))._id;

    const res = await request(getAppHelper())
      .put(`/cle/etablissement/${validId}`)
      .send({
        ...etablissement,
        region: "Bretagne",
        department: "Ille-et-Vilaine",
      });

    expect(res.status).toBe(200);
    expect(res.body.data.region).toBe("Bretagne");
    expect(res.body.data.department).toBe("Ille-et-Vilaine");
    expect(res.body.data.academy).toBe("Rennes");
  });

  it("should update classe region,department,academy when etablissement is updated successfully", async () => {
    const etablissement = createFixtureEtablissement({ department: "Paris", region: "Ile de france" });
    const validId = (await createEtablissement(etablissement))._id;
    const classe = createFixtureClasse({ etablissementId: validId, department: etablissement.department, region: etablissement.region });
    const classeId = (await createClasse(classe))._id;

    const res = await request(getAppHelper())
      .put(`/cle/etablissement/${validId}`)
      .send({
        ...etablissement,
        region: "Bretagne",
        department: "Ille-et-Vilaine",
      });

    const updatedClasse = await CleClasseModel.findById(classeId);

    expect(res.status).toBe(200);
    expect(res.body.data.region).toBe("Bretagne");
    expect(res.body.data.department).toBe("Ille-et-Vilaine");
    expect(updatedClasse.region).toBe(res.body.data.region);
    expect(updatedClasse.department).toBe(res.body.data.department);
  });
});
