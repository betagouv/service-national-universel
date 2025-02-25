import mongoose from "mongoose";

import { createJeune } from "./helper/JeuneHelper";
import { setupAdminTest } from "../../setUpAdminTest";
import { INestApplication } from "@nestjs/common";
import { YOUNG_STATUS, YOUNG_STATUS_PHASE1 } from "snu-lib";
import { LigneDeBusGateway } from "@admin/core/sejours/phase1/ligneDeBus/LigneDeBus.gateway";
import { createLigneDeBus } from "./helper/LigneDeBusHelper";

describe("LigneDeBusGateway", () => {
    let ligneDeBusGateway: LigneDeBusGateway;
    let app: INestApplication;

    beforeAll(async () => {
        const appSetup = await setupAdminTest();
        app = appSetup.app;
        const module = appSetup.adminTestModule;
        ligneDeBusGateway = module.get<LigneDeBusGateway>(LigneDeBusGateway);
        await app.init();
    });

    afterAll(async () => {
        await app.close();
        mongoose.disconnect();
    });

    it("should be defined", () => {
        expect(ligneDeBusGateway).toBeDefined();
    });

    describe("countPlaceOccupeesByLigneDeBusIds", () => {
        it("count des places occupés dans les bus", async () => {
            const ligne1 = await createLigneDeBus();
            const ligne2 = await createLigneDeBus();
            const ligne3 = await createLigneDeBus();
            await createJeune({
                statut: YOUNG_STATUS.VALIDATED,
                statutPhase1: YOUNG_STATUS_PHASE1.AFFECTED,
                ligneDeBusId: ligne1.id,
            });
            await createJeune({
                statut: YOUNG_STATUS.VALIDATED,
                statutPhase1: YOUNG_STATUS_PHASE1.DONE,
                ligneDeBusId: ligne1.id,
            });
            await createJeune({
                statut: YOUNG_STATUS.VALIDATED,
                statutPhase1: YOUNG_STATUS_PHASE1.AFFECTED,
                ligneDeBusId: ligne2.id,
            });
            await createJeune({
                statut: YOUNG_STATUS.VALIDATED,
                statutPhase1: YOUNG_STATUS_PHASE1.AFFECTED,
                ligneDeBusId: ligne2.id,
            });
            await createJeune({
                statut: YOUNG_STATUS.VALIDATED,
                statutPhase1: YOUNG_STATUS_PHASE1.AFFECTED,
                ligneDeBusId: ligne2.id,
            });
            await createJeune({
                statut: YOUNG_STATUS.VALIDATED,
                statutPhase1: YOUNG_STATUS_PHASE1.AFFECTED,
            });

            const result = await ligneDeBusGateway.countPlaceOccupeesByLigneDeBusIds([ligne1.id, ligne2.id, ligne3.id]);

            expect(result.find(({ id }) => ligne1.id === id)?.placesOccupeesJeunes).toBe(2);
            expect(result.find(({ id }) => ligne2.id === id)?.placesOccupeesJeunes).toBe(3);
            expect(result.find(({ id }) => ligne3.id === id)?.placesOccupeesJeunes).toBe(0);
        });
    });
});
