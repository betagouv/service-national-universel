import mongoose from "mongoose";
import { FunctionalException, FunctionalExceptionCode } from "@shared/core/FunctionalException";
import { DepartementGateway } from "@admin/core/referentiel/departement/Departement.gateway";
import { DepartementModel } from "@admin/core/referentiel/departement/Departement.model";
import { createDepartement } from "../helpers/DepartementHelper";
import { setupAdminTest } from "../../setUpAdminTest";
import { INestApplication } from "@nestjs/common";

describe("DepartementGateway", () => {
    let departementGateway: DepartementGateway;
    let app: INestApplication;

    beforeAll(async () => {
        const appSetup = await setupAdminTest();
        app = appSetup.app;
        const module = appSetup.adminTestModule;
        departementGateway = module.get<DepartementGateway>(DepartementGateway);
        await app.init();
    });

    afterAll(async () => {
        await app.close();
        mongoose.disconnect();
    });

    beforeEach(async () => {
        await departementGateway.deleteAll();
    });

    it("should be defined", () => {
        expect(departementGateway).toBeDefined();
    });

    describe("findByCode", () => {
        it("devrait trouver un département par son code", async () => {
            const departement = await createDepartement({
                code: "01",
                libelle: "AIN",
                regionAcademique: "84",
                academie: "10",
                chefLieu: "Bourge En Bresse",
                dateCreationSI: new Date("2024-07-31"),
                dateDerniereModificationSI: new Date("2024-07-31"),
            });

            const result = await departementGateway.findByCode("01");

            expect(result).toMatchObject({
                code: departement.code,
                libelle: departement.libelle,
                regionAcademique: departement.regionAcademique,
                academie: departement.academie,
                chefLieu: departement.chefLieu,
                dateCreationSI: departement.dateCreationSI,
                dateDerniereModificationSI: departement.dateDerniereModificationSI,
            });
        });

        it("should return undefined if departement not found", async () => {
            await expect(departementGateway.findByCode("INVALID")).resolves.toBeUndefined();
        });
    });

    describe("create", () => {
        it("devrait insérer un nouveau département", async () => {
            const newDepartement = {
                code: "75",
                libelle: "PARIS",
                regionAcademique: "11",
                academie: "01",
                dateCreationSI: new Date("2024-07-31"),
                dateDerniereModificationSI: new Date("2024-07-31"),
            };

            const result = await departementGateway.create(newDepartement);

            expect(result).toMatchObject({
                id: expect.any(String),
                ...newDepartement
            });
            const savedDepartement = await departementGateway.findByCode("75");
            expect(savedDepartement).toMatchObject({
                code: newDepartement.code,
                libelle: newDepartement.libelle,
                regionAcademique: newDepartement.regionAcademique,
                academie: newDepartement.academie,
                dateCreationSI: newDepartement.dateCreationSI,
                dateDerniereModificationSI: newDepartement.dateDerniereModificationSI,
            });
        });
    });

    describe("update", () => {
        it("devrait mettre à jour un département existant", async () => {
            const existingDepartement = await createDepartement({
                code: "69",
                libelle: "RHONE",
                regionAcademique: "84",
                academie: "10",
                chefLieu: "Bourge En Bresse",
                dateCreationSI: new Date("2024-07-31"),
                dateDerniereModificationSI: new Date("2024-07-31"),
            });

            const updatedData: DepartementModel = {
                id: existingDepartement.id,
                code: "69",
                libelle: "RHONE UPDATED",
                regionAcademique: "84",
                academie: "10",
                chefLieu: "Bourge En Bresse",
                dateCreationSI: new Date("2024-07-31"),
                dateDerniereModificationSI: new Date("2024-08-01"),
            };

            const result = await departementGateway.update(updatedData);
            expect(result).toEqual(updatedData);
            
            const updatedDepartement = await departementGateway.findByCode(existingDepartement.code);
            expect(updatedDepartement).toMatchObject({
                code: updatedData.code,
                libelle: updatedData.libelle,
                regionAcademique: updatedData.regionAcademique,
                academie: updatedData.academie,
                dateCreationSI: updatedData.dateCreationSI,
                dateDerniereModificationSI: updatedData.dateDerniereModificationSI,
            });
        });

        it("devrait lancer une erreur si le département à mettre à jour n'existe pas", async () => {
            const nonExistentDepartement: DepartementModel = {
                id: new mongoose.Types.ObjectId().toString(),
                code: "99",
                libelle: "INEXISTANT",
                regionAcademique: "99",
                academie: "99",
                dateCreationSI: new Date("2024-07-31"),
                dateDerniereModificationSI: new Date("2024-07-31"),
            };

            await expect(departementGateway.update(nonExistentDepartement)).rejects.toThrow(
                new FunctionalException(
                    FunctionalExceptionCode.NOT_FOUND,
                    `Le département avec le libelle ${nonExistentDepartement.libelle} n'existe pas`,
                ),
            );
        });
    });
});
