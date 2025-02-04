import mongoose, { Model } from "mongoose";
import { FunctionalException, FunctionalExceptionCode } from "@shared/core/FunctionalException";
import { RegionAcademiqueGateway } from "@admin/core/referentiel/regionAcademique/RegionAcademique.gateway";
import { CreateRegionAcademiqueModel, RegionAcademiqueModel } from "@admin/core/referentiel/regionAcademique/RegionAcademique.model";
import { createRegionAcademique, deleteAllRegionAcademiques } from "../helpers/RegionAcademiqueHelper";
import { setupAdminTest } from "../../setUpAdminTest";
import { INestApplication } from "@nestjs/common";

describe("RegionAcademiqueGateway", () => {
    let regionAcademiqueGateway: RegionAcademiqueGateway;
    let app: INestApplication;

    beforeAll(async () => {
        const appSetup = await setupAdminTest();
        app = appSetup.app;
        const module = appSetup.adminTestModule;
        regionAcademiqueGateway = module.get<RegionAcademiqueGateway>(RegionAcademiqueGateway);
        await app.init();
    });

    afterAll(async () => {
        await app.close();
        mongoose.disconnect();
    });

    beforeEach(async () => {
        await deleteAllRegionAcademiques();
    });

    it("should be defined", () => {
        expect(regionAcademiqueGateway).toBeDefined();
    });

    describe("findByCode", () => {
        it("devrait trouver une région académique par son code", async () => {
            const regionAcademique = await createRegionAcademique({
                code: "BRE",
                libelle: "BRETAGNE",
                zone: "B",
                dateDerniereModificationSI: new Date("2024-08-05"),
            });

            const result = await regionAcademiqueGateway.findByCode("BRE");

            expect(result).toMatchObject({
                code: regionAcademique.code,
                libelle: regionAcademique.libelle,
                zone: regionAcademique.zone,
                dateDerniereModificationSI: regionAcademique.dateDerniereModificationSI,
            });
        });

        it("should return undefined if region academique not found", async () => {
            await expect(regionAcademiqueGateway.findByCode("INVALID")).resolves.toBeUndefined();
        });
    });

    describe("create", () => {
        it("devrait insérer une nouvelle région académique", async () => {
            const newRegionAcademique: CreateRegionAcademiqueModel = {
                code: "PDL",
                libelle: "PAYS DE LA LOIRE",
                zone: "B",
                dateDerniereModificationSI: new Date("2024-08-05"),
            };

            const result = await regionAcademiqueGateway.create(newRegionAcademique);

            expect(result).toMatchObject({
                id: expect.any(String),
                ...newRegionAcademique
            });
            const savedRegionAcademique = await regionAcademiqueGateway.findByCode("PDL");
            expect(savedRegionAcademique).toMatchObject({
                code: newRegionAcademique.code,
                libelle: newRegionAcademique.libelle,
                zone: newRegionAcademique.zone,
                dateDerniereModificationSI: newRegionAcademique.dateDerniereModificationSI,
            });
        });

        describe("update", () => {
            it("devrait mettre à jour une région académique existante", async () => {
                const existingRegionAcademique = await createRegionAcademique({
                    code: "NOR",
                    libelle: "NORMANDIE",
                    zone: "B",
                    dateDerniereModificationSI: new Date("2024-08-05"),
                });

                const updatedData: RegionAcademiqueModel = {
                    id: existingRegionAcademique.id,
                    code: "NOR",
                    libelle: "NORMANDIE UPDATED",
                    zone: "A",
                    dateDerniereModificationSI: new Date("2024-08-06"),
                };

                const result = await regionAcademiqueGateway.update(updatedData);
                expect(result).toEqual({
                    id: existingRegionAcademique.id,
                    code: updatedData.code,
                    libelle: updatedData.libelle,
                    zone: updatedData.zone,
                    dateDerniereModificationSI: updatedData.dateDerniereModificationSI,
                });
                const updatedRegionAcademique = await regionAcademiqueGateway.findByCode(existingRegionAcademique.code);
                expect(updatedRegionAcademique).toMatchObject({
                    code: updatedData.code,
                    libelle: updatedData.libelle,
                    zone: updatedData.zone,
                    dateDerniereModificationSI: updatedData.dateDerniereModificationSI,
                });
            });

            it("devrait lancer une erreur si la région académique à mettre à jour n'existe pas", async () => {
                const nonExistentRegionAcademique: RegionAcademiqueModel = {
                    id: new mongoose.Types.ObjectId().toString(),
                    code: "XXX",
                    libelle: "INEXISTANT",
                    zone: "X",
                    dateDerniereModificationSI: new Date("2024-08-05"),
                };

                await expect(regionAcademiqueGateway.update(nonExistentRegionAcademique)).rejects.toThrow(
                    new FunctionalException(
                        FunctionalExceptionCode.NOT_FOUND,
                        `La région académique avec le libelle ${nonExistentRegionAcademique.libelle} n'existe pas`,
                    ),
                );
            });
        });
    });
});
