require("dotenv").config({ path: "./.env-testing" });
const request = require("supertest");
const getAppHelper = require("./helpers/app");
const { dbConnect, dbClose } = require("./helpers/db");
const { createEtablissementHelper, deleteEtablissementByIdHelper, notExistingEtablissementId, updateEtablissementByIdHelper } = require("./helpers/etablissement");
const getNewEtablissementFixture = require("./fixtures/etablissement");
// referent
const { createReferentHelper, deleteReferentByIdHelper } = require("./helpers/referent");
const getNewReferentFixture = require("./fixtures/referent");
// classe
const getNewClasseFixture = require("./fixtures/classe");
const { getClasseHelper, createClasseHelper, deleteClasseByIdHelper, getClasseByIdHelper, notExistingClasseId, updateClasseByIdHelper } = require("./helpers/classe");

beforeAll(dbConnect);
afterAll(dbClose);

describe("Etablissement", () => {
  const passport = require("passport");
  describe("GET /cle/etablissement/:id", () => {
    let etablissement, referent, coordinateur;

    beforeAll(async () => {
      coordinateur = await createReferentHelper(getNewReferentFixture({ role: "coordinateur" }));
      etablissement = await createEtablissementHelper({ ...getNewEtablissementFixture(), coordinateurIds: coordinateur._id });
      referent = await createReferentHelper({
        ...getNewReferentFixture(),
        role: "referent_classe",
      });

      passport.user = referent;
    });

    afterAll(async () => {
      passport.user = null;
    });

    it("should return 200 and etablissement data for authorized user", async () => {
      const res = await request(getAppHelper()).get(`/cle/etablissement/${etablissement._id}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toBeDefined();
      expect(res.body.data._id.toString()).toEqual(etablissement._id.toString());
    });

    it("should return 400 for invalid etablissement id", async () => {
      const res = await request(getAppHelper()).get("/cle/etablissement/invalid-id");
      expect(res.statusCode).toEqual(400);
    });

    it("should return 404 if etablissement not found", async () => {
      const notExistingEtablissementId = "60d49e8fd7984c3f12345678";
      const res = await request(getAppHelper()).get(`/cle/etablissement/${notExistingEtablissementId}`);
      expect(res.statusCode).toEqual(404);
    });

    it("should return 403 when user is not authorized to view etablissement", async () => {
      const unauthorizedReferent = await { ...getNewReferentFixture(), role: "supervisor" };
      passport.user = unauthorizedReferent;
      const res = await request(getAppHelper()).get(`/cle/etablissement/${etablissement._id}`);
      expect(res.statusCode).toEqual(403);
    });
  });

  describe("GET /cle/etablissement/from-user", () => {
    let etablissement, referentEtablissement, referentClasse, coordinateur, classe;
    const passport = require("passport");

    beforeAll(async () => {
      // coordinateur = await createReferentHelper(getNewReferentFixture({ role: "coordinateur" }));
      // referentClasse = await createReferentHelper(getNewReferentFixture({ role: "referent_classe", classeId: classe._id }));
      // etablissement = await createEtablissementHelper(getNewEtablissementFixture({ referentEtablissementIds: [referentEtablissement._id], coordinateurIds: [coordinateur._id] }));
      // classe = await createClasseHelper(getNewClasseFixture({ referentClasseIds: [referentClasse._id], etablissementId: etablissement._id }));

      referentEtablissement = await createReferentHelper(getNewReferentFixture({ role: "administrateur_cle", subRole: "referent_etablissement" }));
      etablissement = await createEtablissementHelper(getNewEtablissementFixture());
      classe = await createClasseHelper(getNewClasseFixture({ etablissementId: etablissement._id }));
      coordinateur = await createReferentHelper(getNewReferentFixture({ role: "coordinateur" }));
      referentClasse = await createReferentHelper(getNewReferentFixture({ role: "referent_classe" }));
      await updateClasseByIdHelper(classe._id, { referentClasseIds: [referentClasse._id] });
      await updateEtablissementByIdHelper(etablissement._id, { referentEtablissementIds: [referentEtablissement._id], coordinateurIds: [coordinateur._id] });
    });

    it("should return 200 and etablissement data for authorized referent_etablissement user", async () => {
      passport.user = referentClasse;
      const res = await request(getAppHelper()).get("/cle/etablissement/from-user");
      expect(res.statusCode).toEqual(200);
      expect(res.body.ok).toEqual(true);
      expect(res.body.data).toBeDefined();
    });

    it("should return 404 if class not found for referent_classe user", async () => {
      passport.user = referentClasse;
      const res = await request(getAppHelper()).get("/cle/etablissement/from-user");
      expect(res.statusCode).toEqual(404);
    });

    it("should return 403 for unauthorized user", async () => {
      const unauthorizedReferent = { ...getNewReferentFixture(), role: "supervisor" };
      passport.user = unauthorizedReferent;
      const res = await request(getAppHelper()).get("/cle/etablissement/from-user");
      expect(res.statusCode).toEqual(403);
    });
  });

  describe("PUT /cle/etablissement/:id", () => {
    let etablissement, referent, updatedEtablissementData;

    beforeAll(async () => {
      referent = await createReferentHelper(getNewReferentFixture({ role: "administrateur_cle", subRole: "referent_etablissement" }));
      etablissement = await createEtablissementHelper(getNewEtablissementFixture({ referentEtablissementIds: [referent._id] }));
      passport.user = referent;

      updatedEtablissementData = {
        name: "Lycée modifié",
        address: "123 Nouvelle Rue",
        zip: "91000",
        city: "Evry",
        department: "ESSONNES",
        region: "Ile-de-France",
        type: ["Lycée Général"],
        sector: ["Statut public"],
      };
    });

    afterAll(async () => {
      passport.user = null;
    });

    it("should update etablissement successfully for authorized user", async () => {
      const res = await request(getAppHelper()).put(`/cle/etablissement/${etablissement._id}`).send(updatedEtablissementData);

      expect(res.statusCode).toEqual(200);
      expect(res.body.ok).toEqual(true);

      expect(res.body.data.name).toEqual(updatedEtablissementData.name);
      expect(res.body.data.address).toEqual(updatedEtablissementData.address);
      expect(res.body.data.zip).toEqual(updatedEtablissementData.zip);
      expect(res.body.data.city).toEqual(updatedEtablissementData.city);
      expect(res.body.data.department).toEqual(updatedEtablissementData.department);
      expect(res.body.data.region).toEqual(updatedEtablissementData.region);
      expect(res.body.data.type).toEqual(expect.arrayContaining(updatedEtablissementData.type));
      expect(res.body.data.sector).toEqual(expect.arrayContaining(updatedEtablissementData.sector));
    });

    it("should return 400 for invalid input", async () => {
      const res = await request(getAppHelper()).put(`/cle/etablissement/${etablissement._id}`).send({ department: 77000 });
      expect(res.statusCode).toEqual(400);
    });

    it("should return 404 if etablissement not found", async () => {
      const notExistingEtablissementId = "60d49e8fd7984c3f12345678";
      const res = await request(getAppHelper()).put(`/cle/etablissement/${notExistingEtablissementId}`).send(updatedEtablissementData);
      expect(res.statusCode).toEqual(404);
    });

    it("should return 403 when user is not authorized to update etablissement", async () => {
      const unauthorizedReferent = { ...getNewReferentFixture(), role: "supervisor" };
      passport.user = unauthorizedReferent;
      const res = await request(getAppHelper()).put(`/cle/etablissement/${etablissement._id}`).send(updatedEtablissementData);
      expect(res.statusCode).toEqual(403);
    });
  });

  describe("PUT /cle/etablissement/:id/referents", () => {
    let etablissement, adminReferent, otherReferent, updatedReferentEtablissementIds;

    beforeAll(async () => {
      adminReferent = await createReferentHelper(getNewReferentFixture());
      otherReferent = await createReferentHelper(getNewReferentFixture({ role: "referent_classe" }));
      etablissement = await createEtablissementHelper(getNewEtablissementFixture());
      passport.user = adminReferent;

      updatedReferentEtablissementIds = [otherReferent._id];
    });

    it("should update referentEtablissementIds successfully for admin user", async () => {
      const res = await request(getAppHelper()).put(`/cle/etablissement/${etablissement._id}/referents`).send({ referentEtablissementIds: updatedReferentEtablissementIds });
      expect(res.statusCode).toEqual(200);
      expect(res.body.ok).toEqual(true);
      const expectedIds = updatedReferentEtablissementIds.map((id) => id.toString());
      const receivedIds = res.body.data.referentEtablissementIds.map((id) => id.toString());
      expect(receivedIds).toEqual(expectedIds);
    });

    it("should return 400 for invalid input", async () => {
      const res = await request(getAppHelper()).put(`/cle/etablissement/${etablissement._id}/referents`).send({ referentEtablissementIds: "60d49e8fd7984c3f12345678" });
      expect(res.statusCode).toEqual(400);
    });

    it("should return 404 if etablissement not found", async () => {
      const notExistingEtablissementId = "60d49e8fd7984c3f12345678";
      const res = await request(getAppHelper())
        .put(`/cle/etablissement/${notExistingEtablissementId}/referents`)
        .send({ referentEtablissementIds: updatedReferentEtablissementIds });
      expect(res.statusCode).toEqual(404);
    });

    it("should return 403 when user is not authorized", async () => {
      const unauthorizedReferent = { ...getNewReferentFixture(), role: "supervisor" };
      passport.user = unauthorizedReferent;
      const res = await request(getAppHelper()).put(`/cle/etablissement/${etablissement._id}/referents`).send({ referentEtablissementIds: updatedReferentEtablissementIds });
      expect(res.statusCode).toEqual(403);
    });

    afterAll(async () => {
      passport.user = null;
    });
  });
});
