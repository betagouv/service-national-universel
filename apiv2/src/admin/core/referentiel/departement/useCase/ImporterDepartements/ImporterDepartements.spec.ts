import { Test, TestingModule } from "@nestjs/testing";
import { FileGateway } from "@shared/core/File.gateway";
import { ReferentielTaskType } from "snu-lib";
import { ReferentielImportTaskParameters } from "@admin/core/referentiel/ReferentielImportTask.model";
import { Logger } from "@nestjs/common";
import { ClockGateway } from "@shared/core/Clock.gateway";
import { NotificationGateway } from "@notification/core/Notification.gateway";
import { DepartementImportService } from "../../DepartementImport.service";
import { ImporterDepartements } from "./ImporterDepartements";
import { DepartementGateway } from "../../Departement.gateway";
import { DEPARTEMENT_COLUMN_NAMES } from "../../Departement.model";
import { DepartementImportMapper } from "../../DepartementMapper";

describe("ImporterDepartements", () => {
    let useCase: ImporterDepartements;
    let departementImportService: DepartementImportService;
    let departementGateway: DepartementGateway;
    let fileGateway: FileGateway;
    let clockGateway: ClockGateway;

    const mockDate = "31/07/2024";
    const mockDatePlus1 = "01/08/2024";

    let departementRecord = {
        [DEPARTEMENT_COLUMN_NAMES.code]: "001",
        [DEPARTEMENT_COLUMN_NAMES.libelle]: "AIN",
        [DEPARTEMENT_COLUMN_NAMES.chefLieu]: "Bourg en Bresse",
        [DEPARTEMENT_COLUMN_NAMES.regionAcademique]: "AUVERGNE-RHONE-ALPES",
        [DEPARTEMENT_COLUMN_NAMES.academie]: "LYON",
        [DEPARTEMENT_COLUMN_NAMES.dateCreationSI]: mockDate,
        [DEPARTEMENT_COLUMN_NAMES.dateDerniereModificationSI]: mockDate,
    };

    const importDepartementModel = DepartementImportMapper.fromRecord(departementRecord);

    let mockDepartementDb = {
        ...importDepartementModel,
        id: "1",
    };

    const mockParams: ReferentielImportTaskParameters = {
        type: ReferentielTaskType.IMPORT_DEPARTEMENTS,
        fileName: "test",
        fileKey: "test",
        fileLineCount: 1,
        auteur: {
            id: "test",
            prenom: "test",
            nom: "test",
            role: "test",
            sousRole: "test",
        },
        folderPath: "",
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ImporterDepartements,
                DepartementImportService,
                Logger,
                {
                    provide: ClockGateway,
                    useValue: {
                        now: jest.fn(),
                        formatSafeDateTime: jest.fn().mockReturnValue(mockDate),
                        isValidDate: jest.fn().mockReturnValue(true),
                    },
                },
                {
                    provide: NotificationGateway,
                    useValue: {
                        sendEmail: jest.fn(),
                    },
                },
                {
                    provide: FileGateway,
                    useValue: {
                        downloadFile: jest.fn().mockResolvedValue({ Body: "mocked file content" }),
                        parseXLS: jest.fn(),
                    },
                },
                {
                    provide: DepartementGateway,
                    useValue: {
                        findByCode: jest.fn(),
                        create: jest.fn(() => mockDepartementDb),
                        update: jest.fn(() => mockDepartementDb),
                    },
                },
            ],
        }).compile();

        useCase = module.get<ImporterDepartements>(ImporterDepartements);
        departementImportService = module.get<DepartementImportService>(DepartementImportService);
        departementGateway = module.get<DepartementGateway>(DepartementGateway);
        fileGateway = module.get<FileGateway>(FileGateway);
        clockGateway = module.get<ClockGateway>(ClockGateway);
    });

    describe("execute", () => {
        describe("Create departement", () => {
            it("Not existing row", async () => {
                jest.spyOn(fileGateway, "parseXLS").mockResolvedValue([departementRecord]);
                jest.spyOn(departementGateway, "findByCode").mockResolvedValue(undefined);

                const result = await useCase.execute(mockParams);

                expect(departementGateway.create).toHaveBeenCalledTimes(1);
                expect(departementGateway.update).toHaveBeenCalledTimes(0);

                expect(result).toContainEqual(
                    expect.objectContaining({
                        code: "001",
                        libelle: "AIN",
                        chefLieu: "Bourg en Bresse",
                        regionAcademique: "AUVERGNE-RHONE-ALPES",
                        academie: "LYON",
                        result: "success",
                    }),
                );
            });
        });

        describe("Update departement", () => {
            it("Existing row ET siEntity.dateDerniereModificationSI is greater than internalEntity.dateDerniereModificationSI", async () => {
                let departementRecordPlus1 = {
                    ...departementRecord,
                    [DEPARTEMENT_COLUMN_NAMES.dateDerniereModificationSI]: mockDatePlus1,
                };

                jest.spyOn(fileGateway, "parseXLS").mockResolvedValue([departementRecordPlus1]);
                jest.spyOn(departementGateway, "findByCode").mockResolvedValue(mockDepartementDb);

                const result = await useCase.execute(mockParams);

                expect(departementGateway.create).toHaveBeenCalledTimes(0);
                expect(departementGateway.update).toHaveBeenCalledTimes(1);

                expect(result).toContainEqual(
                    expect.objectContaining({
                        code: "001",
                        libelle: "AIN",
                        chefLieu: "Bourg en Bresse",
                        regionAcademique: "AUVERGNE-RHONE-ALPES",
                        academie: "LYON",
                        dateDerniereModificationSI: expect.any(Date),
                        result: "success",
                    }),
                );
            });
        });

        describe("no creation, No update", () => {
            it("Empty buffer", async () => {
                jest.spyOn(fileGateway, "parseXLS").mockResolvedValue([]);

                const result = await useCase.execute(mockParams);

                expect(departementGateway.create).toHaveBeenCalledTimes(0);
                expect(departementGateway.update).toHaveBeenCalledTimes(0);

                expect(result).toEqual([]);
            });

            it("Data Validation - Code - Empty", async () => {
                let departementRecordEmpty = {
                    ...departementRecord,
                    [DEPARTEMENT_COLUMN_NAMES.code]: "",
                };

                jest.spyOn(fileGateway, "parseXLS").mockResolvedValue([departementRecordEmpty]);

                const result = await useCase.execute(mockParams);

                expect(result).toContainEqual(
                    expect.objectContaining({
                        code: "",
                        libelle: "AIN",
                        chefLieu: "Bourg en Bresse",
                        regionAcademique: "AUVERGNE-RHONE-ALPES",
                        academie: "LYON",
                        dateDerniereModificationSI: expect.any(Date),
                        result: "error",
                        error: "Invalid format - code",
                    }),
                );

                expect(departementGateway.create).toHaveBeenCalledTimes(0);
                expect(departementGateway.update).toHaveBeenCalledTimes(0);
            });

            it("Data Validation - Code - Invalid format - less than 3 letters", async () => {
                let departementRecordLessThan3Letters = {
                    ...departementRecord,
                    [DEPARTEMENT_COLUMN_NAMES.code]: "01",
                };

                jest.spyOn(fileGateway, "parseXLS").mockResolvedValue([departementRecordLessThan3Letters]);

                const result = await useCase.execute(mockParams);

                expect(result).toContainEqual(
                    expect.objectContaining({
                        code: "01",
                        libelle: "AIN",
                        chefLieu: "Bourg en Bresse",
                        regionAcademique: "AUVERGNE-RHONE-ALPES",
                        academie: "LYON",
                        dateDerniereModificationSI: expect.any(Date),
                        result: "error",
                        error: "Invalid format - code",
                    }),
                );

                expect(departementGateway.create).toHaveBeenCalledTimes(0);
                expect(departementGateway.update).toHaveBeenCalledTimes(0);
            });

            it("Data Validation - libelle - Invalid format - Empty", async () => {
                let departementRecordEmpty = {
                    ...departementRecord,
                    [DEPARTEMENT_COLUMN_NAMES.libelle]: "",
                };

                jest.spyOn(fileGateway, "parseXLS").mockResolvedValue([departementRecordEmpty]);

                const result = await useCase.execute(mockParams);

                expect(result).toContainEqual(
                    expect.objectContaining({
                        code: "001",
                        libelle: "",
                        chefLieu: "Bourg en Bresse",
                        regionAcademique: "AUVERGNE-RHONE-ALPES",
                        academie: "LYON",
                        dateDerniereModificationSI: expect.any(Date),
                        result: "error",
                        error: "Invalid format - libelle",
                    }),
                );

                expect(departementGateway.create).toHaveBeenCalledTimes(0);
                expect(departementGateway.update).toHaveBeenCalledTimes(0);
            });

            it("Data Validation - Date modification SI - Invalid format - Empty", async () => {
                let departementRecordEmpty = {
                    ...departementRecord,
                    [DEPARTEMENT_COLUMN_NAMES.dateDerniereModificationSI]: "",
                };

                jest.spyOn(clockGateway, "isValidDate").mockRestore();
                jest.spyOn(fileGateway, "parseXLS").mockResolvedValue([departementRecordEmpty]);

                const result = await useCase.execute(mockParams);

                expect(result).toContainEqual(
                    expect.objectContaining({
                        code: "001",
                        libelle: "AIN",
                        chefLieu: "Bourg en Bresse",
                        regionAcademique: "AUVERGNE-RHONE-ALPES",
                        academie: "LYON",
                        dateDerniereModificationSI: expect.any(Date),
                        result: "error",
                        error: "Invalid format - dateDerniereModificationSI",
                    }),
                );

                expect(departementGateway.create).toHaveBeenCalledTimes(0);
                expect(departementGateway.update).toHaveBeenCalledTimes(0);
            });

            it("Data Validation - Date creation SI - Invalid format - Invalid date format", async () => {
                jest.spyOn(fileGateway, "parseXLS").mockResolvedValue([
                    {
                        ...departementRecord,
                        [DEPARTEMENT_COLUMN_NAMES.dateDerniereModificationSI]: "jeudi dernier",
                    },
                ]);
                jest.spyOn(clockGateway, "isValidDate").mockRestore();

                const result = await useCase.execute(mockParams);

                expect(result).toContainEqual(
                    expect.objectContaining({
                        code: "001",
                        libelle: "AIN",
                        chefLieu: "Bourg en Bresse",
                        regionAcademique: "AUVERGNE-RHONE-ALPES",
                        academie: "LYON",
                        dateDerniereModificationSI: expect.any(Date),
                        result: "error",
                        error: "Invalid format - dateDerniereModificationSI",
                    }),
                );

                expect(departementGateway.create).toHaveBeenCalledTimes(0);
                expect(departementGateway.update).toHaveBeenCalledTimes(0);
            });

            it("Existing row ET date_derniere_modification_si is less or equal than date_derniere_modification_si_db", async () => {
                let departementRecordLessThanMockDate = {
                    ...departementRecord,
                    [DEPARTEMENT_COLUMN_NAMES.dateDerniereModificationSI]: mockDate,
                };

                jest.spyOn(fileGateway, "parseXLS").mockResolvedValue([departementRecordLessThanMockDate]);

                jest.spyOn(departementGateway, "findByCode").mockResolvedValue(mockDepartementDb);

                const result = await useCase.execute(mockParams);
                expect(departementGateway.create).toHaveBeenCalledTimes(0);
                expect(departementGateway.update).toHaveBeenCalledTimes(0);

                expect(result).toEqual([
                    {
                        code: "001",
                        libelle: "AIN",
                        chefLieu: "Bourg en Bresse",
                        regionAcademique: "AUVERGNE-RHONE-ALPES",
                        academie: "LYON",
                        dateCreationSI: new Date("2024-07-31"),
                        dateDerniereModificationSI: new Date("2024-07-31"),
                        result: "success",
                    },
                ]);
            });
        });
    });
});
