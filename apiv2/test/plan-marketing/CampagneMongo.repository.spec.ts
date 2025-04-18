import { INestApplication } from "@nestjs/common";
import {
    CampagneComplete,
    CampagneGeneriqueModel,
    CampagneSpecifiqueModelWithRef,
    CampagneSpecifiqueModelWithoutRef,
} from "@plan-marketing/core/Campagne.model";
import { CampagneGateway } from "@plan-marketing/core/gateway/Campagne.gateway";
import { CAMPAGNE_MONGOOSE_ENTITY, CampagneDocument } from "@plan-marketing/infra/CampagneMongo.provider";
import mongoose, { Model } from "mongoose";
import { CampagneJeuneType, DestinataireListeDiffusion, TypeEvenement } from "snu-lib";
import { createCampagne } from "./CampagneHelper";
import { setUpPlanMarketingTest } from "./setUpPlanMarketingTest";

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

    beforeEach(async () => {
        await campagneMongoose.deleteMany({});
    });

    describe("update", () => {
        it("should update a campagne and add a programmation", async () => {
            const createdAt = new Date();
            const createdCampagne = (await createCampagne({
                nom: "Campagne Test",
                generic: false,
                programmations: [
                    {
                        joursDecalage: 2,
                        type: TypeEvenement.DATE_OUVERTURE_INSCRIPTIONS,
                    },
                ],
            })) as CampagneComplete;

            const newProgrammation = {
                joursDecalage: 3,
                type: TypeEvenement.DATE_OUVERTURE_INSCRIPTIONS,
            };
            const result = (await campagneGateway.update({
                ...createdCampagne,
                nom: "Updated Test Campaign",
                programmations: [...(createdCampagne?.programmations || []), newProgrammation],
            } as CampagneSpecifiqueModelWithoutRef)) as CampagneSpecifiqueModelWithoutRef;

            const expectedCampagne = {
                ...createdCampagne,
                nom: "Updated Test Campaign",
            };

            expect(result.id).toEqual(expectedCampagne.id);
            expect(result.nom).toEqual(expectedCampagne.nom);
            expect(result.objet).toEqual(expectedCampagne.objet);
            expect(result.templateId).toEqual(expectedCampagne.templateId);
            expect(result.type).toEqual(expectedCampagne.type);
            expect(result.listeDiffusionId).toEqual(expectedCampagne.listeDiffusionId);

            expect(result.programmations?.length).toEqual(
                createdCampagne.programmations && createdCampagne.programmations.length + 1,
            );
            expect(result.programmations?.[0].joursDecalage).toEqual(createdCampagne.programmations?.[0].joursDecalage);
            expect(result.programmations?.[0].type).toEqual(createdCampagne.programmations?.[0].type);
            expect(result.programmations?.[0].id).toBeDefined();

            expect(result.programmations?.[1].joursDecalage).toEqual(newProgrammation.joursDecalage);
            expect(result.programmations?.[1].type).toEqual(newProgrammation.type);
            expect(result.programmations?.[1].id).toBeDefined();
        });
    });

    describe("updateAndRemoveRef", () => {
        it("should update a campagne and remove reference", async () => {
            const generiqueCampagneId = new mongoose.Types.ObjectId().toString();
            const envoiDate = new Date();
            const programmations = [
                {
                    joursDecalage: 1,
                    type: TypeEvenement.DATE_VALIDATION_PHASE1,
                    envoiDate: envoiDate,
                },
            ];
            const specificCampagne = (await createCampagne({
                nom: "Campagne Test",
                generic: false,
                campagneGeneriqueId: generiqueCampagneId,
                programmations: programmations,
            } as any)) as any;

            const result = (await campagneGateway.updateAndRemoveRef({
                id: specificCampagne.id,
                generic: false,
                originalCampagneGeneriqueId: generiqueCampagneId,
                nom: "Updated Without Ref",
                programmations: programmations,
            } as CampagneSpecifiqueModelWithoutRef)) as CampagneSpecifiqueModelWithoutRef;

            expect(result).toBeDefined();
            expect(result?.campagneGeneriqueId).toBeUndefined();
            expect(result?.nom).toBe("Updated Without Ref");
            expect(result?.originalCampagneGeneriqueId).toBe(generiqueCampagneId);
            expect(result?.programmations?.[0].id).toBeDefined();
            expect(result?.programmations?.[0].joursDecalage).toEqual(programmations[0].joursDecalage);
            expect(result?.programmations?.[0].type).toEqual(programmations[0].type);
            expect(result?.programmations?.[0].createdAt).toBeDefined();
            expect(result?.programmations?.[0].envoiDate).toEqual(programmations[0].envoiDate);
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
                    },
                    {
                        joursDecalage: 5,
                        type: TypeEvenement.DATE_FIN_SEJOUR,
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

        it("should only return campagnes with isProgrammationActive === true", async () => {
            const activeCampagne = (await createCampagne({
                nom: "Active Campaign",
                generic: true,
                isProgrammationActive: true,
                programmations: [
                    {
                        joursDecalage: 3,
                        type: TypeEvenement.DATE_OUVERTURE_INSCRIPTIONS,
                    },
                ],
            })) as CampagneGeneriqueModel;

            const inactiveCampagne = (await createCampagne({
                nom: "Inactive Campaign",
                generic: true,
                isProgrammationActive: false,
                programmations: [
                    {
                        joursDecalage: 3,
                        type: TypeEvenement.DATE_OUVERTURE_INSCRIPTIONS,
                    },
                ],
            })) as CampagneGeneriqueModel;

            const results = await campagneGateway.search({ isProgrammationActive: true });

            const foundActive = results.some((campagne) => campagne.id === activeCampagne.id);
            const foundInactive = results.some((campagne) => campagne.id === inactiveCampagne.id);

            expect(results.length).toBe(1);
            expect(foundActive).toBeTruthy();
            expect(foundInactive).toBeFalsy();
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
                    },
                ],
            });

            await campagneGateway.delete(campagne.id);
            const found = await campagneGateway.findById(campagne.id);
            expect(found).toBeNull();
        });
    });

    describe("findById", () => {
        it("should return null when a campagne does not exist", async () => {
            const nonExistentId = new mongoose.Types.ObjectId().toString();
            const found = await campagneGateway.findById(nonExistentId);
            expect(found).toBeNull();
        });

        it("should return a campagne without reference when it exists", async () => {
            const campagne = (await createCampagne({
                nom: "Campagne Sans Ref",
                generic: false,
                objet: "Test Object",
                programmations: [
                    {
                        joursDecalage: 1,
                        type: TypeEvenement.DATE_DEBUT_SEJOUR,
                    },
                ],
            })) as CampagneSpecifiqueModelWithoutRef;

            const found = await campagneGateway.findById(campagne.id);
            expect(found).toBeDefined();
            expect(found?.id).toBe(campagne.id);
            expect((found as CampagneSpecifiqueModelWithoutRef)?.nom).toBe("Campagne Sans Ref");
            expect((found as CampagneSpecifiqueModelWithoutRef)?.objet).toBe("Test Object");
        });

        it("should return a campagne with reference including generic campaign data", async () => {
            const genericCampagne = (await createCampagne({
                nom: "Generic Test Campaign",
                objet: "Generic Subject",
                type: CampagneJeuneType.CLE,
                destinataires: [DestinataireListeDiffusion.CHEFS_CENTRES],
                generic: true,
                templateId: 456,
                listeDiffusionId: "JEUNES",
                programmations: [
                    {
                        joursDecalage: 5,
                        type: TypeEvenement.DATE_FIN_SEJOUR,
                    },
                ],
            })) as CampagneGeneriqueModel;

            const specificCampagne = (await createCampagne({
                generic: false,
                campagneGeneriqueId: genericCampagne.id,
                cohortId: "cohort-test-findById",
            })) as CampagneSpecifiqueModelWithRef;

            const found = await campagneGateway.findById(specificCampagne.id);

            expect(found).toBeDefined();
            expect(found?.id).toBe(specificCampagne.id);
            expect((found as any)?.nom).toBe("Generic Test Campaign");
            expect((found as any)?.objet).toBe("Generic Subject");
            expect((found as any)?.type).toBe(CampagneJeuneType.CLE);
            expect((found as any)?.destinataires).toEqual([DestinataireListeDiffusion.CHEFS_CENTRES]);
            expect((found as any)?.templateId).toBe(456);
            expect((found as any)?.listeDiffusionId).toBe("JEUNES");
            expect((found as any)?.generic).toBe(false);
            expect(JSON.stringify((found as any)?.programmations)).toEqual(
                JSON.stringify(genericCampagne.programmations),
            );
        });
    });

    describe("findCampagnesWithProgrammationBetweenDates", () => {
        it("should find campagnes without ref that have programmation dates in the range", async () => {
            const now = new Date();
            const startDate = new Date(now);
            startDate.setDate(now.getDate() - 1);
            const endDate = new Date(now);
            endDate.setDate(now.getDate() + 1);
            const inRangeDate = new Date(now);

            const campagneInRange = await createCampagne({
                nom: "Campagne In Range",
                generic: false,
                programmations: [
                    {
                        joursDecalage: 1,
                        type: TypeEvenement.AUCUN,
                        envoiDate: inRangeDate,
                    },
                ],
            });

            const beforeStartDate = new Date(startDate);
            beforeStartDate.setDate(startDate.getDate() - 2);
            await createCampagne({
                nom: "Campagne Outside Range",
                generic: false,
                programmations: [
                    {
                        joursDecalage: 1,
                        type: TypeEvenement.AUCUN,
                        envoiDate: beforeStartDate,
                    },
                ],
            });

            const results = await campagneGateway.findCampagnesWithProgrammationBetweenDates(startDate, endDate);

            expect(results.some((campagne) => campagne.id === campagneInRange.id)).toBeTruthy();
            expect(results.length).toBeGreaterThanOrEqual(1);
            //@ts-expect-error has a nom property
            expect(results[0].nom).toBe("Campagne In Range");
        });

        it("should find campagnes with ref that have programmation dates in the range", async () => {
            const now = new Date();
            const startDate = new Date(now);
            startDate.setDate(now.getDate() - 1);
            const endDate = new Date(now);
            endDate.setDate(now.getDate() + 1);
            const inRangeDate = new Date(now);

            const genericCampagne = await createCampagne({
                nom: "Generic With In Range Programmation",
                generic: true,
                programmations: [
                    {
                        joursDecalage: 1,
                        type: TypeEvenement.AUCUN,
                        envoiDate: inRangeDate,
                    },
                ],
            });

            const specificCampagne = await createCampagne({
                generic: false,
                campagneGeneriqueId: genericCampagne.id,
                cohortId: "cohort-test",
            });

            const results = await campagneGateway.findCampagnesWithProgrammationBetweenDates(startDate, endDate);
            expect(results.some((campagne) => campagne.id === specificCampagne.id)).toBeTruthy();
            //@ts-expect-error has a nom property
            expect(results[0].nom).toBe("Generic With In Range Programmation");
        });

        it("should not find campagnes that have programmation dates outside the range", async () => {
            const now = new Date();
            const startDate = new Date(now);
            startDate.setDate(now.getDate() + 10);
            const endDate = new Date(now);
            endDate.setDate(now.getDate() + 20);

            const campagneOutsideRange = await createCampagne({
                nom: "Campagne Outside Future Range",
                generic: true,
                programmations: [
                    {
                        joursDecalage: 1,
                        type: TypeEvenement.DATE_DEBUT_SEJOUR,
                        envoiDate: now,
                    },
                ],
            });

            const results = await campagneGateway.findCampagnesWithProgrammationBetweenDates(startDate, endDate);

            expect(results.some((c) => c.id === campagneOutsideRange.id)).toBeFalsy();
        });
    });
});
