import { INestApplication } from "@nestjs/common";
import { CampagneGateway } from "@plan-marketing/core/gateway/Campagne.gateway";
import { CAMPAGNE_MONGOOSE_ENTITY, CampagneDocument } from "@plan-marketing/infra/CampagneMongo.provider";
import mongoose, { Model } from "mongoose";
import { createCampagne } from "./CampagneHelper";
import { setUpPlanMarketingTest } from "./setUpPlanMarketingTest";
import { CampagneJeuneType, DestinataireListeDiffusion, ListeDiffusionEnum } from "snu-lib";

describe("CampagneGateway", () => {
    let campagneGateway: CampagneGateway;
    let app: INestApplication;
    let campagneMongoose: Model<CampagneDocument>;

    beforeAll(async () => {
        const appSetup = await setUpPlanMarketingTest();
        app = appSetup.app;
        const module = appSetup.testModule;
        campagneGateway = module.get<CampagneGateway>(CampagneGateway);
        campagneMongoose = module.get<Model<CampagneDocument>>(CAMPAGNE_MONGOOSE_ENTITY);
    });

    afterAll(async () => {
        await app.close();
        mongoose.disconnect();
    });

    describe("update", () => {
        it("should update a campagne", async () => {
            const createdCampagne = await createCampagne({
                nom: "Campagne Test",
                generic: true,
            });

            const expectedCampagne = {
                ...createdCampagne,
                nom: "Updated Test Campaign",
            };

            const result = await campagneGateway.update({ ...createdCampagne, nom: "Updated Test Campaign" } as any);
            expect(result).toEqual(expectedCampagne);
        });
    });

    describe("updateAndRemoveRef", () => {
        it("should update a campagne and remove reference", async () => {
            const createdCampagne = (await createCampagne({
                nom: "Campagne Test",
                generic: false,
                campagneGeneriqueId: "someId",
            } as any)) as any;

            const result = (await campagneGateway.updateAndRemoveRef({
                id: createdCampagne.id,
                generic: false,
                originalCampagneGeneriqueId: createdCampagne.campagneGeneriqueId,
                nom: "Updated Without Ref",
            } as any)) as any;

            expect(result).toBeDefined();
            expect(result?.campagneGeneriqueId).toBeUndefined();
            expect(result?.nom).toBe("Updated Without Ref");
        });
    });

    describe("search", () => {
        it("should return campagnes with populated generic campaign data", async () => {
            const genericCampagne = await createCampagne({
                nom: "Generic Campaign",
                objet: "Generic Subject",
                type: CampagneJeuneType.CLE,
                destinataires: [DestinataireListeDiffusion.CHEFS_CENTRES],
                generic: true,
                templateId: 123,
            });

            const specificCampagne = await createCampagne({
                generic: false,
                campagneGeneriqueId: genericCampagne.id,
                cohortId: "cohort1",
            });

            const results = await campagneGateway.search();
            const found = results.find((c) => c.id === specificCampagne.id) as any;

            expect(found).toBeDefined();
            expect(found?.nom).toBe("Generic Campaign");
            expect(found?.objet).toBe("Generic Subject");
            expect(found?.type).toBe(CampagneJeuneType.CLE);
            expect(found?.destinataires).toEqual([DestinataireListeDiffusion.CHEFS_CENTRES]);
            expect(found?.templateId).toBe(123);
        });
    });

    describe("delete", () => {
        it("should delete a campagne", async () => {
            const campagne = await createCampagne({
                nom: "To Delete",
                generic: true,
            });

            await campagneGateway.delete(campagne.id);
            const found = await campagneGateway.findById(campagne.id);
            expect(found).toBeNull();
        });
    });
});
