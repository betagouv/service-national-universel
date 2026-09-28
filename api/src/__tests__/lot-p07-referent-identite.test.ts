/**
 * Lot P07 de l'audit de sécurité de la production du 25/09/2026 (GOO-62 : PH12, PH17).
 *
 * `POST /young/signup/email` (changeEmailDuringSignUp) appliquait un changement d'email de compte
 * jeune en base avant toute validation par le jeton envoyé à la nouvelle adresse — vecteur secondaire
 * cité par PH17. Sans appelant dans app ni admin (les inscriptions sont fermées depuis M3, lot H1),
 * la route est supprimée plutôt que corrigée.
 */
import request from "supertest";

import getAppHelper, { resetAppAuth } from "./helpers/app";
import getNewYoungFixture from "./fixtures/young";
import { createYoungHelper } from "./helpers/young";
import { dbConnect, dbClose } from "./helpers/db";
import { YoungModel, YoungDocument } from "../models";

let young: YoungDocument;

beforeAll(async () => {
  await dbConnect(__filename.slice(__dirname.length + 1, -3));
  young = await createYoungHelper(getNewYoungFixture({ emailVerified: "false" } as any));
});
afterAll(dbClose);
afterEach(resetAppAuth);

describe("PH17 — POST /young/signup/email supprimée (changeEmailDuringSignUp)", () => {
  it("n'est plus montée", async () => {
    const response = await request(getAppHelper(young)).post("/young/signup/email").send({ email: "nouveau@example.org" });

    expect(response.status).toBe(404);
    // Le 404 par défaut d'Express n'a pas de corps applicatif : un gestionnaire encore monté qui ne
    // trouve pas la ressource répondrait { ok: false, code: "INVALID_PARAMS" } ou "BAD_REQUEST".
    expect(response.body?.ok).toBeUndefined();
    expect(response.body?.code).toBeUndefined();

    const apres = await YoungModel.findById(young._id);
    expect(apres!.email).toBe(young.email);
  });
});
