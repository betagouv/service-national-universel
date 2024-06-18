const request = require("supertest");
const getAppHelper = require("./helpers/app");
const { createEtablissement } = require("./helpers/etablissement");
const { createFixtureEtablissement } = require("./fixtures/etablissement");
const { ROLES } = require("snu-lib");
const passport = require("passport");
const { dbConnect, dbClose } = require("./helpers/db");
const { ObjectId } = require("mongoose").Types;
const { CleEtablissementModel } = require("../models");

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
        id: validId,
        state: "inactive",
      });

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe(etablissement.name);
    expect(res.body.data.state).toBe("inactive");
  });
});
