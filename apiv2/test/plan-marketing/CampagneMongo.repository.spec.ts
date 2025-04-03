import { INestApplication } from "@nestjs/common";
import { CampagneGateway } from "@plan-marketing/core/gateway/Campagne.gateway";
import { CAMPAGNE_MONGOOSE_ENTITY, CampagneDocument } from "@plan-marketing/infra/CampagneMongo.provider";
import mongoose, { Model } from "mongoose";
import { createCampagne } from "./CampagneHelper";
import { setUpPlanMarketingTest } from "./setUpPlanMarketingTest";
import { CampagneJeuneType, DestinataireListeDiffusion, ListeDiffusionEnum, TypeEvenement } from "snu-lib";
import {
    CampagneGeneriqueModel,
    CampagneModel,
    CampagneSpecifiqueModelWithRef,
    CampagneSpecifiqueModelWithoutRef,
} from "@plan-marketing/core/Campagne.model";

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
            const createdAt = new Date();
            const createdCampagne = (await createCampagne({
                nom: "Campagne Test",
                generic: true,
                programmations: [
                    {
                        joursDecalage: 2,
                        type: TypeEvenement.DATE_OUVERTURE_INSCRIPTIONS,
                        createdAt,
                    },
                ],
            })) as CampagneSpecifiqueModelWithoutRef;

            const newProgrammation = {
                joursDecalage: 3,
                type: TypeEvenement.DATE_OUVERTURE_INSCRIPTIONS,
                createdAt: new Date(),
            };
            const result = await campagneGateway.update({
                ...createdCampagne,
                nom: "Updated Test Campaign",
                programmations: [...createdCampagne.programmations, newProgrammation],
            } as CampagneSpecifiqueModelWithoutRef);

            const expectedCampagne = {
                ...createdCampagne,
                nom: "Updated Test Campaign",
                programmations: [...createdCampagne.programmations, newProgrammation],
            };

            const resultForComparison = JSON.stringify(result);
            const expectedForComparison = JSON.stringify(expectedCampagne);

            expect(resultForComparison).toEqual(expectedForComparison);
        });
    });

    describe("updateAndRemoveRef", () => {
        it("should update a campagne and remove reference", async () => {
            const generiqueCampagneId = new mongoose.Types.ObjectId().toString();
            const specificCampagne = (await createCampagne({
                nom: "Campagne Test",
                generic: false,
                campagneGeneriqueId: generiqueCampagneId,
            } as any)) as any;
            const envoiDate = new Date();
            const programmations = [
                {
                    joursDecalage: 1,
                    type: TypeEvenement.DATE_VALIDATION_PHASE1,
                    createdAt: new Date(),
                    envoiDate: envoiDate,
                },
            ];
            const result = (await campagneGateway.updateAndRemoveRef({
                id: specificCampagne.id,
                generic: false,
                originalCampagneGeneriqueId: generiqueCampagneId,
                nom: "Updated Without Ref",
                programmations: programmations,
            } as CampagneSpecifiqueModelWithoutRef)) as CampagneSpecifiqueModelWithoutRef;
            console.log(result);
            expect(result).toBeDefined();
            expect(result?.campagneGeneriqueId).toBeUndefined();
            expect(result?.nom).toBe("Updated Without Ref");
            expect(result?.originalCampagneGeneriqueId).toBe(generiqueCampagneId);
            expect(result?.programmations).toEqual(programmations);
        });
    });

    describe("search", () => {
        it("should return campagnes with populated generic campaign data", async () => {
            const genericCampagne = (await createCampagne({
                nom: "Generic Campaign",
                objet: "Generic Subject",
                type: CampagneJeuneType.CLE,
                destinataires: [DestinataireListeDiffusion.CHEFS_CENTRES],
                generic: true,
                templateId: 123,
                programmations: [
                    {
                        joursDecalage: 3,
                        type: TypeEvenement.DATE_OUVERTURE_INSCRIPTIONS,
                        createdAt: new Date(),
                    },
                    {
                        joursDecalage: 5,
                        type: TypeEvenement.DATE_FIN_SEJOUR,
                        createdAt: new Date(),
                    },
                ],
            })) as CampagneGeneriqueModel;

            const specificCampagne = (await createCampagne({
                generic: false,
                campagneGeneriqueId: genericCampagne.id,
                cohortId: "cohort1",
            })) as CampagneSpecifiqueModelWithRef;

            const results = await campagneGateway.search();
            const found = results.find((c) => c.id === specificCampagne.id) as any;

            expect(found).toBeDefined();
            expect(found?.nom).toBe("Generic Campaign");
            expect(found?.objet).toBe("Generic Subject");
            expect(found?.type).toBe(CampagneJeuneType.CLE);
            expect(found?.destinataires).toEqual([DestinataireListeDiffusion.CHEFS_CENTRES]);
            expect(found?.templateId).toBe(123);
            expect(JSON.stringify(found?.programmations)).toEqual(JSON.stringify(genericCampagne.programmations));
        });
    });

    describe("delete", () => {
        it("should delete a campagne", async () => {
            const campagne = await createCampagne({
                nom: "To Delete",
                generic: true,
                programmations: [
                    {
                        joursDecalage: 1,
                        type: TypeEvenement.DATE_DEBUT_SEJOUR,
                        createdAt: new Date(),
                    },
                ],
            });

            await campagneGateway.delete(campagne.id);
            const found = await campagneGateway.findById(campagne.id);
            expect(found).toBeNull();
        });
    });
});
