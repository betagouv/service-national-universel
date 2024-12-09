import mongoose, { Model } from "mongoose";
import { FunctionalException, FunctionalExceptionCode } from "@shared/core/FunctionalException";
import { REGION_ACADEMIQUE_MONGOOSE_ENTITY, RegionAcademiqueDocument } from "@admin/infra/referentiel/regionAcademique/RegionAcademiqueMongo.provider";
import { INestApplication } from "@nestjs/common";
import { RegionAcademiqueGateway } from "@admin/core/referentiel/regionAcademique/RegionAcademique.gateway";
import { ClsService } from "nestjs-cls";
import { setupAdminTest } from "../../setUpAdminTest";
import { CreateRegionAcademiqueModel, RegionAcademiqueModel } from "@admin/core/referentiel/regionAcademique/RegionAcademique.model";

describe("RegionAcademiqueRepository", () => {
    let regionAcademiqueGateway: RegionAcademiqueGateway;
    let app: INestApplication;
    let regionAcademiqueMongoose: Model<RegionAcademiqueDocument>;
    let cls: ClsService;

    beforeAll(async () => {
        const appSetup = await setupAdminTest();
        app = appSetup.app;
        const module = appSetup.adminTestModule;
        regionAcademiqueGateway = module.get<RegionAcademiqueGateway>(RegionAcademiqueGateway);
        regionAcademiqueMongoose = module.get<Model<RegionAcademiqueDocument>>(REGION_ACADEMIQUE_MONGOOSE_ENTITY);
        cls = module.get(ClsService);
        await app.init();
    });

    afterAll(async () => {
        await app.close();
        mongoose.disconnect();
    });

    beforeEach(async () => {
        await regionAcademiqueMongoose.deleteMany({});
    });

    describe("findByCode", () => {
        it("devrait trouver une région académique par son code", async () => {
            // GIVEN
            const regionAcademique: CreateRegionAcademiqueModel = {
                code: "BRE",
                libelle: "BRETAGNE",
                zone: "B",
                dateCreationSI: new Date("2024-07-31"),
                dateDerniereModificationSI: new Date("2024-08-05"),
            };
            await regionAcademiqueMongoose.create(regionAcademique);

            // WHEN
            const result = await regionAcademiqueGateway.findByCode("BRE");

            // THEN
            expect(result).toMatchObject({
                code: regionAcademique.code,
                libelle: regionAcademique.libelle,
                zone: regionAcademique.zone,
                dateCreationSI: regionAcademique.dateCreationSI,
                dateDerniereModificationSI: regionAcademique.dateDerniereModificationSI
            });
        });

        it("devrait lancer une erreur si la région académique n'existe pas", async () => {
            // WHEN / THEN
            await expect(regionAcademiqueGateway.findByCode("INVALID")).rejects.toThrow(
                new FunctionalException(
                    FunctionalExceptionCode.NOT_FOUND,
                    "La région académique avec le code INVALID n'existe pas",
                ),
            );
        });
    });

    describe("insert", () => {
        it("devrait insérer une nouvelle région académique", async () => {
            // GIVEN
            const newRegionAcademique: CreateRegionAcademiqueModel = {
                code: "PDL",
                libelle: "PAYS DE LA LOIRE",
                zone: "B",
                dateCreationSI: new Date("2024-07-31"),
                dateDerniereModificationSI: new Date("2024-08-05"),
            };

            // WHEN
            const result = await regionAcademiqueGateway.insert(newRegionAcademique);

            // THEN
            expect(result).toMatchObject(newRegionAcademique);
            const savedRegionAcademique = await regionAcademiqueMongoose.findOne({ code: "PDL" });
            expect(savedRegionAcademique).toMatchObject(newRegionAcademique);
        });
    });

    describe("update", () => {
        it("devrait mettre à jour une région académique existante", async () => {
            // GIVEN
            const existingRegionAcademique = await regionAcademiqueMongoose.create({
                code: "NOR",
                libelle: "NORMANDIE",
                zone: "B",
                dateCreationSI: new Date("2024-07-31"),
                dateDerniereModificationSI: new Date("2024-08-05"),
            });

            const updatedData: RegionAcademiqueModel = {
                id: existingRegionAcademique._id.toString(),
                code: "NOR",
                libelle: "NORMANDIE UPDATED",
                zone: "A",
                dateCreationSI: new Date("2024-07-31"),
                dateDerniereModificationSI: new Date("2024-08-06"),
            };

            // WHEN
            const result = await regionAcademiqueGateway.update(updatedData);

            // THEN
            expect(result).toMatchObject(updatedData);
            const updatedRegionAcademique = await regionAcademiqueMongoose.findById(existingRegionAcademique._id);
            expect(updatedRegionAcademique).toMatchObject({
                code: "NOR",
                libelle: "NORMANDIE UPDATED",
                zone: "A",
            });
        });

        it("devrait lancer une erreur si la région académique à mettre à jour n'existe pas", async () => {
            // GIVEN
            const nonExistentRegionAcademique: RegionAcademiqueModel = {
                id: new mongoose.Types.ObjectId().toString(),
                code: "XXX",
                libelle: "INEXISTANT",
                zone: "X",
                dateCreationSI: new Date(),
                dateDerniereModificationSI: new Date(),
            };

            // WHEN / THEN
            await expect(regionAcademiqueGateway.update(nonExistentRegionAcademique)).rejects.toThrow(
                new FunctionalException(
                    FunctionalExceptionCode.NOT_FOUND,
                    `La région académique avec le libelle ${nonExistentRegionAcademique.libelle} n'existe pas`,
                ),
            );
        });
    });
});