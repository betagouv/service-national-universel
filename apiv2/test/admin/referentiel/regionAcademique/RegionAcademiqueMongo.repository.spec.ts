import mongoose, { Model } from "mongoose";
import { FunctionalException, FunctionalExceptionCode } from "@shared/core/FunctionalException";
import { REGION_ACADEMIQUE_MONGOOSE_ENTITY, RegionAcademiqueDocument, regionAcademiqueMongoProviders } from "@admin/infra/referentiel/regionAcademique/RegionAcademiqueMongo.provider";
import { RegionAcademiqueGateway } from "@admin/core/referentiel/regionAcademique/RegionAcademique.gateway";
import { CreateRegionAcademiqueModel, RegionAcademiqueModel } from "@admin/core/referentiel/regionAcademique/RegionAcademique.model";
import { Test } from "@nestjs/testing";
import { RegionAcademiqueMongoRepository } from "@admin/infra/referentiel/regionAcademique/RegionAcademiqueMongo.repository";
import { testDatabaseProviders } from "../../../testDatabaseProvider";
import { RegionAcademiqueMapper } from "@admin/infra/referentiel/regionAcademique/RegionAcademique.mapper";



describe("RegionAcademiqueGateway", () => {
    let regionAcademiqueGateway: RegionAcademiqueGateway;
    let regionAcademiqueMongoose: Model<RegionAcademiqueDocument>;

    beforeAll(async () => {
        const module = await Test.createTestingModule({
            imports: [],
            providers: [
                {
                    provide: RegionAcademiqueGateway,
                    useClass: RegionAcademiqueMongoRepository
                },
                ...regionAcademiqueMongoProviders,
                testDatabaseProviders(false)
            ]  
        }).compile();


        regionAcademiqueGateway = module.get<RegionAcademiqueGateway>(RegionAcademiqueGateway);
        regionAcademiqueMongoose = module.get<Model<RegionAcademiqueDocument>>(REGION_ACADEMIQUE_MONGOOSE_ENTITY);
    });

    afterAll(async () => {
        mongoose.disconnect();
    });

    beforeEach(async () => {
        await regionAcademiqueMongoose.deleteMany({});
    });

    it("should be defined", () => {
        expect(regionAcademiqueGateway).toBeDefined();
    });

    describe("findByCode", () => {
        it("devrait trouver une région académique par son code", async () => {
            const regionAcademique = new regionAcademiqueMongoose({
                code: "BRE",
                libelle: "BRETAGNE",
                zone: "B",
                date_derniere_modification_si: new Date("2024-08-05"),
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            await regionAcademique.save();

            const result = await regionAcademiqueGateway.findByCode("BRE");

            expect(result).toMatchObject({
                code: regionAcademique.code,
                libelle: regionAcademique.libelle,
                zone: regionAcademique.zone,
                dateDerniereModificationSI: regionAcademique.date_derniere_modification_si,
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

            const savedRegionAcademique = await regionAcademiqueMongoose.findOne({ code: "PDL" });
            expect(savedRegionAcademique).toMatchObject({
                code: newRegionAcademique.code,
                libelle: newRegionAcademique.libelle,
                zone: newRegionAcademique.zone,
                date_derniere_modification_si: newRegionAcademique.dateDerniereModificationSI,
                createdAt: expect.any(Date),
                updatedAt: expect.any(Date),
                __v: expect.any(Number),
                _id: expect.any(mongoose.Types.ObjectId),
            });
        });
    });

    describe("update", () => {
        it("devrait mettre à jour une région académique existante", async () => {
            const existingRegionAcademique = await regionAcademiqueMongoose.create(RegionAcademiqueMapper.toDocument({
                id: new mongoose.Types.ObjectId().toString(),
                code: "NOR",
                libelle: "NORMANDIE",
                zone: "B",
                dateDerniereModificationSI: new Date("2024-08-05"),
            }));

            const updatedData: RegionAcademiqueModel = {
                id: existingRegionAcademique._id,
                code: "NOR",
                libelle: "NORMANDIE UPDATED",
                zone: "A",
                dateDerniereModificationSI: new Date("2024-08-06"),
            };

            const result = await regionAcademiqueGateway.update(updatedData);
            expect(result).toEqual({
                id: existingRegionAcademique._id.toString(),
                code: updatedData.code,
                libelle: updatedData.libelle,
                zone: updatedData.zone, 
                dateDerniereModificationSI: updatedData.dateDerniereModificationSI,
            });
            const updatedRegionAcademique = await regionAcademiqueMongoose.findById(existingRegionAcademique._id);
            expect(updatedRegionAcademique).toMatchObject({
                code: updatedData.code,
                libelle: updatedData.libelle,
                zone: updatedData.zone,
                date_derniere_modification_si: updatedData.dateDerniereModificationSI,
                createdAt: expect.any(Date),
                updatedAt: expect.any(Date),
                __v: expect.any(Number),
                _id: expect.any(mongoose.Types.ObjectId),
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