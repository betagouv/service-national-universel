import * as request from "supertest";
import mongoose from "mongoose";

import { INestApplication } from "@nestjs/common";
import { TestingModule } from "@nestjs/testing";

import { YOUNG_STATUS, YOUNG_STATUS_PHASE1 } from "snu-lib";

import { Phase1Controller } from "@admin/infra/sejours/phase1/api/Phase1.controller";
import { JeuneGateway } from "@admin/core/sejours/jeune/Jeune.gateway";

import { setupAdminTest } from "../../setUpAdminTest";
import { createSession } from "./helper/SessionHelper";
import { createLigneDeBus } from "./helper/LigneDeBusHelper";
import { createSejour } from "./helper/SejourHelper";
import { createPointDeRassemblement } from "./helper/PointDeRassemblementHelper";
import { createPlanDeTransport } from "./helper/PlanDeTransportHelper";
import { ClsService } from "nestjs-cls";
import { createJeune } from "./helper/JeuneHelper";

jest.mock("@nestjs-cls/transactional", () => ({
    Transactional: () => jest.fn(),
}));

describe("Phase1Controller", () => {
    let app: INestApplication;
    let cls: ClsService;
    let phase1Controller: Phase1Controller;
    let mockedAddUserToRequestMiddleware;
    let module: TestingModule;
    let jeuneGateway: JeuneGateway;
    beforeAll(async () => {
        const appSetup = await setupAdminTest();
        app = appSetup.app;

        module = appSetup.adminTestModule;
        phase1Controller = module.get<Phase1Controller>(Phase1Controller);
        mockedAddUserToRequestMiddleware = jest.fn((req, res, next) => {
            req.user = {
                role: "admin",
                sousRole: "god",
            };
            next();
        });

        app.use(mockedAddUserToRequestMiddleware);

        jeuneGateway = module.get<JeuneGateway>(JeuneGateway);
        cls = module.get<ClsService>(ClsService);
        await app.init();
    });

    it("should be defined", () => {
        expect(phase1Controller).toBeDefined();
    });

    describe("DELETE /phase1/:id/plan-de-transport", () => {
        it("should return 200", async () => {
            const session = await createSession();
            const pdr = await createPointDeRassemblement();
            const sejour = await createSejour({ sessionId: session.id });
            const ligne = await createLigneDeBus({
                sessionId: session.id,
                sessionNom: session.nom,
                pointDeRassemblementIds: [pdr.id],
            });
            await createPlanDeTransport({
                sessionNom: session.nom,
                sessionId: session.id,
            });

            const jeuneBefore = await createJeune({
                statut: YOUNG_STATUS.VALIDATED,
                statutPhase1: YOUNG_STATUS_PHASE1.AFFECTED,
                sessionId: session.id,
                sessionNom: session.nom,
                sejourId: sejour.id,
                ligneDeBusId: ligne.id,
                pointDeRassemblementId: pdr.id,
            });
            const response = await cls.runWith(
                // @ts-ignore
                { user: null },
                () => request(app.getHttpServer()).delete(`/phase1/${session.id}/plan-de-transport`),
            );

            expect(response.status).toBe(200);

            const jeuneAfter = await jeuneGateway.findById(jeuneBefore.id);
            expect(jeuneAfter.statutPhase1).toBe(YOUNG_STATUS_PHASE1.WAITING_AFFECTATION);
            expect(jeuneAfter.youngPhase1Agreement).toBe("false");
            expect(jeuneAfter.centreId).toBeUndefined();
            expect(jeuneAfter.pointDeRassemblementId).toBeUndefined();
            expect(jeuneAfter.ligneDeBusId).toBeUndefined();
        });
    });

    afterAll(async () => {
        await app.close();
        mongoose.disconnect();
    });
});
