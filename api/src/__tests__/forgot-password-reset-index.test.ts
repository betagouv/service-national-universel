import { ReferentModel, YoungModel } from "../models";
import { dbConnect, dbClose } from "./helpers/db";

// `Auth.forgotPasswordReset` retrouve le compte par son jeton de réinitialisation. Sans index, chaque
// tentative (y compris refusée) parcourt toute la collection : 460 à 700 ms de médiane en prod début
// novembre 2026. On vérifie ici que la requête exacte de `auth.ts` passe par l'index partiel.
const INDEX_NAME = "forgotPasswordResetToken_1";
const TOKEN = "a".repeat(40);

const resetQuery = (token: string) => ({
  forgotPasswordResetToken: token,
  forgotPasswordResetExpires: { $gt: Date.now() },
  deletedAt: { $exists: false },
});

beforeAll(async () => {
  await dbConnect(__filename.slice(__dirname.length + 1, -3));
});
afterAll(async () => {
  await dbClose();
});

jest.setTimeout(60000);

// Requête passée par Mongoose, comme dans auth.ts : c'est lui qui convertit `Date.now()` en Date.
const explainReset = async (Model: any, token: string) => {
  const result = await Model.find(resetQuery(token)).explain("executionStats");
  return Array.isArray(result) ? result[0] : result;
};

describe.each([
  ["young", YoungModel],
  ["referent", ReferentModel],
])("index du jeton de réinitialisation (%s)", (_, Model: any) => {
  beforeAll(async () => {
    await Model.collection.deleteMany({});
    // Même chemin qu'au démarrage de l'API : l'autoIndex de Mongoose crée les index déclarés.
    await Model.init();
    // Le champ vaut "" par défaut : la majorité des comptes n'a aucune demande en cours.
    const idle = Array.from({ length: 50 }, (__, i) => ({ email: `idle${i}@example.com`, forgotPasswordResetToken: "" }));
    await Model.collection.insertMany([
      ...idle,
      { email: "pending@example.com", forgotPasswordResetToken: TOKEN, forgotPasswordResetExpires: new Date(Date.now() + 3600_000) },
      { email: "other@example.com", forgotPasswordResetToken: "b".repeat(40), forgotPasswordResetExpires: new Date(Date.now() + 3600_000) },
    ]);
  });
  afterAll(async () => {
    await Model.collection.deleteMany({});
  });

  it("est partiel : seuls les jetons non vides y entrent", async () => {
    const indexes = await Model.collection.indexes();
    const index = indexes.find((i) => i.name === INDEX_NAME);
    expect(index).toBeDefined();
    expect(index.key).toEqual({ forgotPasswordResetToken: 1 });
    expect(index.partialFilterExpression).toEqual({ forgotPasswordResetToken: { $gt: "" } });
  });

  it("sert la requête de forgotPasswordReset (IXSCAN, pas de COLLSCAN)", async () => {
    const explain = await explainReset(Model, TOKEN);
    const plan = JSON.stringify(explain.queryPlanner.winningPlan);
    expect(plan).toContain("IXSCAN");
    expect(plan).toContain(INDEX_NAME);
    expect(plan).not.toContain("COLLSCAN");
    // Un seul document examiné, au lieu de toute la collection.
    expect(explain.executionStats.nReturned).toBe(1);
    expect(explain.executionStats.totalDocsExamined).toBe(1);
  });

  it("refuse un jeton inconnu sans parcourir la collection", async () => {
    const explain = await explainReset(Model, "c".repeat(40));
    expect(JSON.stringify(explain.queryPlanner.winningPlan)).toContain(INDEX_NAME);
    expect(explain.executionStats.nReturned).toBe(0);
    expect(explain.executionStats.totalDocsExamined).toBe(0);
  });
});
