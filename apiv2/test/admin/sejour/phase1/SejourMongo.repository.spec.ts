import mongoose from "mongoose";

import { createJeune } from "./helper/JeuneHelper";
import { setupAdminTest } from "../../setUpAdminTest";
import { INestApplication } from "@nestjs/common";
import { YOUNG_STATUS, YOUNG_STATUS_PHASE1 } from "snu-lib";

import { createSejour } from "./helper/SejourHelper";
import { SejourGateway } from "@admin/core/sejours/phase1/sejour/Sejour.gateway";

describe("SejourGateway", () => {
    let sejourGateway: SejourGateway;
    let app: INestApplication;

    beforeAll(async () => {
        const appSetup = await setupAdminTest();
        app = appSetup.app;
        const module = appSetup.adminTestModule;
        sejourGateway = module.get<SejourGateway>(SejourGateway);
        await app.init();
    });

    afterAll(async () => {
        await app.close();
        mongoose.disconnect();
    });

    it("should be defined", () => {
        expect(sejourGateway).toBeDefined();
    });

    describe("countPlaceOccupeesBySejourIds", () => {
        it("count des places occupés dans les bus", async () => {
            const sejour1 = await createSejour();
            const sejour2 = await createSejour();
            const sejour3 = await createSejour();
            await createJeune({
                statut: YOUNG_STATUS.VALIDATED,
                statutPhase1: YOUNG_STATUS_PHASE1.AFFECTED,
                sejourId: sejour1.id,
            });
            await createJeune({
                statut: YOUNG_STATUS.VALIDATED,
                statutPhase1: YOUNG_STATUS_PHASE1.DONE,
                sejourId: sejour1.id,
            });
            await createJeune({
                statut: YOUNG_STATUS.VALIDATED,
                statutPhase1: YOUNG_STATUS_PHASE1.AFFECTED,
                sejourId: sejour2.id,
            });
            await createJeune({
                statut: YOUNG_STATUS.VALIDATED,
                statutPhase1: YOUNG_STATUS_PHASE1.AFFECTED,
                sejourId: sejour2.id,
            });
            await createJeune({
                statut: YOUNG_STATUS.VALIDATED,
                statutPhase1: YOUNG_STATUS_PHASE1.AFFECTED,
                sejourId: sejour2.id,
            });
            await createJeune({
                statut: YOUNG_STATUS.VALIDATED,
                statutPhase1: YOUNG_STATUS_PHASE1.AFFECTED,
            });

            const result = await sejourGateway.countPlaceOccupeesBySejourIds([sejour1.id, sejour2.id, sejour3.id]);

            expect(result.find(({ id }) => sejour1.id === id)?.placesOccupeesJeunes).toBe(2);
            expect(result.find(({ id }) => sejour2.id === id)?.placesOccupeesJeunes).toBe(3);
            expect(result.find(({ id }) => sejour3.id === id)?.placesOccupeesJeunes).toBe(0);
        });
    });
});
