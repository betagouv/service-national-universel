require("dotenv").config({ path: "./.env-testing" });
const request = require("supertest");
const getAppHelper = require("./helpers/app");
const { dbConnect, dbClose } = require("./helpers/db");

const getNewClasseFixture = require("./fixtures/classe");
const { getClasseHelper, createClasseHelper, deleteClasseByIdHelper, getClasseByIdHelper, notExistingClasseId } = require("./helpers/classe");
// referent
const { createReferentHelper } = require("./helpers/referent");
const getNewReferentFixture = require("./fixtures/referent");

describe("POST /classe/", () => {
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
    const res = await request(getAppHelper()).post("/classe/").send(getNewClasseFixture());
    expect(res.statusCode).toEqual(200);
    expect(res.body.ok).toEqual(true);
    expect(res.body.young).toBeDefined();
  });

  it("should return 400 for invalid input", async () => {
    const res = await request(getAppHelper()).post("/classe/").send({ firstName: "123" });

    expect(res.statusCode).toEqual(400);
  });

  it("should return 403 when user is not authorized to create classe", async () => {
    const unauthorizedReferent = { ...getNewReferentFixture(), role: "supervisor" };
    passport.user = unauthorizedReferent;

    const res = await request(getAppHelper()).post("/classe/").send(getNewClasseFixture());
    expect(res.statusCode).toEqual(403);

    // Remettre le referent autorisé pour les autres tests
    passport.user = referent;
  });

  describe("PUT /classe/:id", () => {
    let referent, classe, updatedClasse;

    beforeAll(async () => {
      referent = await createReferentHelper(getNewReferentFixture());
      classe = await createClasseHelper(getNewClasseFixture());
      updatedClasse = { ...classe, name: "newClasse" };
      passport.user = referent;
    });

    console.log(classe);

    it("should update a class successfully", async () => {
      const res = await request(getAppHelper()).put(`/classe/${classe._id}`).send(updatedClasse);

      expect(res.statusCode).toEqual(200);
      expect(res.body.ok).toEqual(true);
      expect(res.body.data.name).toEqual(updatedClasse.name);
    });

    it("should return 400 for invalid input", async () => {
      const res = await request(getAppHelper()).put(`/classe/${classe._id}`).send({}); // Données invalides

      expect(res.statusCode).toEqual(400);
    });

    it("should return 403 when user is not authorized to update", async () => {
      const unauthorizedReferent = { ...getNewReferentFixture(), role: "supervisor" };
      passport.user = unauthorizedReferent;

      const res = await request(getAppHelper()).put(`/${classe._id}`).send(updatedClasse);
      expect(res.statusCode).toEqual(403);

      passport.user = referent;
    });

    it("should return 404 if class is not found", async () => {
      const res = await request(getAppHelper()).put(`/classe/non-existing-id`).send(updatedClasse);

      expect(res.statusCode).toEqual(404);
    });

    afterAll(dbClose);
  });

  describe("DELETE /classe/:id", () => {
    let classe, referent;
    const passport = require("passport");

    beforeAll(async () => {
      await dbConnect();
      classe = await createClasseHelper(getNewClasseFixture());
      referent = await createReferentHelper(getNewReferentFixture());
      passport.user = referent;
    });

    console.log(classe);

    it("should delete class successfully", async () => {
      const res = await request(getAppHelper()).delete(`/classe/${classe._id}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.ok).toEqual(true);

      const deletedClasse = await getClasseByIdHelper(classe._id);
      expect(deletedClasse).toBeNull();
    });

    it("should return 400 for invalid ID", async () => {
      const res = await request(getAppHelper()).delete(`/classe/invalid-Id`);

      expect(res.statusCode).toEqual(400);
    });

    it("should return 404 if class not found", async () => {
      const res = await request(getAppHelper()).delete(`/classe/${notExistingClasseId}`);

      expect(res.statusCode).toEqual(404);
    });

    it("should return 403 when user is not authorized to delete", async () => {
      const unauthorizedReferent = { ...getNewReferentFixture(), role: "supervisor" };
      passport.user = unauthorizedReferent;
      const res = await request(getAppHelper()).delete(`/classe/${classe._id}`);

      expect(res.statusCode).toEqual(403);
    });

    afterEach(async () => {
      // Nettoyage: supprimez la classe créée pour le test si elle existe toujours
      await deleteClasseByIdHelper(classe._id);
    });

    afterAll(async () => {
      await dbClose();
    });
  });
});

// jest.mock('../../models/cle/classe', () => {
//     const mockClasseModel = {
//       find: jest.fn().mockResolvedValue([...]), // Remplacer [...] par les données mockées
//       findById: jest.fn().mockImplementation(id => Promise.resolve({
//         // Retournez un objet de classe mocké avec des champs virtuels
//         _id: id,
//         region: 'mock-region',
//         department: 'mock-department',
//         etablissement: {/* informations de l'établissement mockées */},
//         populate: jest.fn().mockReturnThis(), // Simule le comportement de populate
//       })),
//       create: jest.fn().mockResolvedValue({/* objet mocké */}),
//       // Autres méthodes mockées si nécessaire
//     };

//     return mockClasseModel;
//   });
