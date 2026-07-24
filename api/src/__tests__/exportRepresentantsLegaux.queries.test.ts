import { dbConnect, dbClose } from "./helpers/db";
import { YoungModel } from "../models";
import getNewYoungFixture from "./fixtures/young";
import { findRepresentantFirstNames } from "../scripts/exportRepresentantsLegaux.queries";

// Le hook post("save") du modèle Young saute la synchro Brevo quand ENVIRONMENT === "test",
// mais le api/.env local force ENVIRONMENT=production : on stub sync/unsync (scopé à ce fichier)
// pour garder le test hors-ligne/déterministe, comme les autres tests qui créent un Young.
jest.mock("../brevo", () => ({ ...jest.requireActual("../brevo"), sync: jest.fn(), unsync: jest.fn() }));

beforeAll(async () => {
  await dbConnect(__filename.slice(__dirname.length + 1, -3));
});
afterAll(dbClose);

describe("findRepresentantFirstNames (lecture seule)", () => {
  it("retrouve le prénom via parent1/parent2 (email normalisé) et ignore les inconnus", async () => {
    const y = await YoungModel.create({
      ...getNewYoungFixture(),
      email: "rl-jeune@test.fr",
      parent1Email: "Papa@Test.fr", // stocké en minuscule (lowercase:true dans le schéma)
      parent1FirstName: "Papa",
      parent2Email: "maman@test.fr",
      parent2FirstName: "Maman",
    });
    const map = await findRepresentantFirstNames(["papa@test.fr", "maman@test.fr", "inconnu@test.fr"]);
    expect(map.get("papa@test.fr")).toBe("Papa");
    expect(map.get("maman@test.fr")).toBe("Maman");
    expect(map.has("inconnu@test.fr")).toBe(false);
    await YoungModel.deleteOne({ _id: y._id });
  });
});
