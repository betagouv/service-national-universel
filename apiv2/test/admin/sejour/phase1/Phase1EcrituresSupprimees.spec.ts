import * as request from "supertest";
import mongoose from "mongoose";

import { INestApplication } from "@nestjs/common";

import { setupAdminTest } from "../../setUpAdminTest";

jest.mock("@nestjs-cls/transactional", () => ({
    Transactional: () => jest.fn(),
}));

// Décision produit du 2026-09-24 : plus aucune écriture phase 1 depuis apiv2. Les routes sont
// supprimées (pas verrouillées) : même un super admin reçoit 404. Les lectures restent servies.
describe("Écritures phase 1 supprimées (apiv2)", () => {
    let app: INestApplication;
    const sessionId = new mongoose.Types.ObjectId().toString();
    const taskId = new mongoose.Types.ObjectId().toString();
    const ligneId = new mongoose.Types.ObjectId().toString();
    const centreId = new mongoose.Types.ObjectId().toString();

    beforeAll(async () => {
        const appSetup = await setupAdminTest();
        app = appSetup.app;
        app.use((req, _res, next) => {
            req.user = { id: "1", prenom: "super", nom: "admin", role: "admin", sousRole: "god" };
            next();
        });
        await app.init();
    });

    afterAll(async () => {
        await app.close();
        mongoose.disconnect();
    });

    it.each([
        ["post", `/affectation/${sessionId}/simulation/hts`],
        ["post", `/affectation/${sessionId}/simulation/hts-dromcom`],
        ["post", `/affectation/${sessionId}/simulation/cle`],
        ["post", `/affectation/${sessionId}/simulation/cle-dromcom`],
        ["post", `/affectation/${sessionId}/simulation/${taskId}/valider/hts`],
        ["post", `/affectation/${sessionId}/simulation/${taskId}/valider/hts-dromcom`],
        ["post", `/affectation/${sessionId}/simulation/${taskId}/valider/cle`],
        ["post", `/affectation/${sessionId}/simulation/${taskId}/valider/cle-dromcom`],
        ["post", `/affectation/${sessionId}/ligne-de-bus/sync-places`],
        ["post", `/affectation/${sessionId}/centre/sync-places`],
        ["post", `/affectation/${sessionId}/centre/${centreId}/sync-places`],
        ["delete", `/phase1/${sessionId}/plan-de-transport`],
        ["delete", `/phase1/${sessionId}/ligne-de-bus/${ligneId}`],
        ["post", `/desistement/${sessionId}/simulation`],
        ["post", `/desistement/${sessionId}/simulation/${taskId}/valider`],
        ["post", `/inscription/${sessionId}/bascule-jeunes-valides/simulation`],
        ["post", `/inscription/${sessionId}/simulation/${taskId}/bascule-jeunes-valides/valider`],
        ["post", `/inscription/${sessionId}/bascule-jeunes-non-valides/simulation`],
        ["post", `/inscription/${sessionId}/simulation/${taskId}/bascule-jeunes-non-valides/valider`],
    ])("%s %s répond 404 pour un super admin", async (method, url) => {
        const response = await request(app.getHttpServer())[method](url).send({});

        expect(response.status).toBe(404);
    });

    it.each([
        `/affectation/${sessionId}/HTS`,
        `/desistement/${sessionId}`,
        `/inscription/${sessionId}/bascule-jeunes-valides/status`,
        `/inscription/${sessionId}/bascule-jeunes-non-valides/status`,
        `/phase1/${sessionId}/simulations`,
        `/phase1/${sessionId}/traitements`,
    ])("la lecture GET %s reste servie", async (url) => {
        const response = await request(app.getHttpServer()).get(url);

        expect(response.status).toBe(200);
    });

    it("POST /classe/:id/inscription-manuelle reste routée", async () => {
        const response = await request(app.getHttpServer())
            .post(`/classe/${new mongoose.Types.ObjectId().toString()}/inscription-manuelle`)
            .send({});

        expect(response.status).not.toBe(404);
    });
});
