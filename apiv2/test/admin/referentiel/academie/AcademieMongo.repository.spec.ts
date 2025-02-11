import mongoose from "mongoose";
import { FunctionalException, FunctionalExceptionCode } from "@shared/core/FunctionalException";
import { AcademieGateway } from "@admin/core/referentiel/academie/Academie.gateway";
import { AcademieModel } from "@admin/core/referentiel/academie/Academie.model";
import { createAcademie } from "../helpers/AcademieHelper";
import { setupAdminTest } from "../../setUpAdminTest";
import { INestApplication } from "@nestjs/common";

describe("AcademieGateway", () => {
    let academieGateway: AcademieGateway;
    let app: INestApplication;

    beforeAll(async () => {
        const appSetup = await setupAdminTest();
        app = appSetup.app;
        const module = appSetup.adminTestModule;
        academieGateway = module.get<AcademieGateway>(AcademieGateway);
        await app.init();
    });

    afterAll(async () => {
        await app.close();
        mongoose.disconnect();
    });

    beforeEach(async () => {
        await academieGateway.deleteAll();
    });

    it("should be defined", () => {
        expect(academieGateway).toBeDefined();
    });

    describe("findByCode", () => {
        it("devrait trouver une académie par son code", async () => {
            const academie = await createAcademie({
                code: "001",
                libelle: "LYON",
                regionAcademique: "AUVERGNE-RHONE-ALPES",
                dateCreationSI: new Date("2024-07-31"),
                dateDerniereModificationSI: new Date("2024-07-31"),
            });

            const result = await academieGateway.findByCode("001");

            expect(result).toMatchObject({
                code: academie.code,
                libelle: academie.libelle,
                regionAcademique: academie.regionAcademique,
                dateCreationSI: academie.dateCreationSI,
                dateDerniereModificationSI: academie.dateDerniereModificationSI,
            });
        });

        it("should return undefined if academie not found", async () => {
            await expect(academieGateway.findByCode("INVALID")).resolves.toBeUndefined();
        });
    });

    describe("create", () => {
        it("devrait insérer une nouvelle académie", async () => {
            const newAcademie = {
                code: "002",
                libelle: "PARIS",
                regionAcademique: "ILE-DE-FRANCE",
                dateCreationSI: new Date("2024-07-31"),
                dateDerniereModificationSI: new Date("2024-07-31"),
            };

            const result = await academieGateway.create(newAcademie);

            expect(result).toMatchObject({
                id: expect.any(String),
                ...newAcademie
            });
            const savedAcademie = await academieGateway.findByCode("002");
            expect(savedAcademie).toMatchObject({
                code: newAcademie.code,
                libelle: newAcademie.libelle,
                regionAcademique: newAcademie.regionAcademique,
                dateCreationSI: newAcademie.dateCreationSI,
                dateDerniereModificationSI: newAcademie.dateDerniereModificationSI,
            });
        });
    });

    describe("update", () => {
        it("devrait mettre à jour une académie existante", async () => {
            const existingAcademie = await createAcademie({
                code: "003",
                libelle: "BORDEAUX",
                regionAcademique: "NOUVELLE-AQUITAINE",
                dateCreationSI: new Date("2024-07-31"),
                dateDerniereModificationSI: new Date("2024-07-31"),
            });

            const updatedData: AcademieModel = {
                id: existingAcademie.id,
                code: "003",
                libelle: "BORDEAUX UPDATED",
                regionAcademique: "NOUVELLE-AQUITAINE UPDATED",
                dateCreationSI: new Date("2024-07-31"),
                dateDerniereModificationSI: new Date("2024-08-01"),
            };

            const result = await academieGateway.update(updatedData);
            expect(result).toEqual(updatedData);
            
            const updatedAcademie = await academieGateway.findByCode(existingAcademie.code);
            expect(updatedAcademie).toMatchObject({
                code: updatedData.code,
                libelle: updatedData.libelle,
                regionAcademique: updatedData.regionAcademique,
                dateCreationSI: updatedData.dateCreationSI,
                dateDerniereModificationSI: updatedData.dateDerniereModificationSI,
            });
        });

        it("devrait lancer une erreur si l'académie à mettre à jour n'existe pas", async () => {
            const nonExistentAcademie: AcademieModel = {
                id: new mongoose.Types.ObjectId().toString(),
                code: "999",
                libelle: "INEXISTANT",
                regionAcademique: "INEXISTANT",
                dateCreationSI: new Date("2024-07-31"),
                dateDerniereModificationSI: new Date("2024-07-31"),
            };

            await expect(academieGateway.update(nonExistentAcademie)).rejects.toThrow(
                new FunctionalException(
                    FunctionalExceptionCode.NOT_FOUND,
                    `L'académie avec le libelle ${nonExistentAcademie.libelle} n'existe pas`,
                ),
            );
        });
    });
});
