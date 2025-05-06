import { Test, TestingModule } from "@nestjs/testing";
import { JeuneGateway } from "@admin/core/sejours/jeune/Jeune.gateway";
import { ClockGateway } from "@shared/core/Clock.gateway";
import { CryptoGateway } from "@shared/core/Crypto.gateway";
import { FileGateway } from "@shared/core/File.gateway";
import { FunctionalException, FunctionalExceptionCode } from "@shared/core/FunctionalException";
import { CLASSE_IMPORT_EN_MASSE_COLUMNS, YOUNG_SOURCE, YOUNG_STATUS, YOUNG_STATUS_PHASE1 } from "snu-lib";
import { ClasseService } from "../../Classe.service";
import { ImportClasseEnMasseTaskParameters } from "../ClasseImportEnMasse.model";
import { ImporterClasseEnMasse } from "./ImporterClasseEnMasse";
import { Logger } from "@nestjs/common";

describe("ImporterClasseEnMasse", () => {
    let importerClasseEnMasse: ImporterClasseEnMasse;
    let jeuneGateway: JeuneGateway;
    let fileGateway: FileGateway;
    let clockGateway: ClockGateway;
    let cryptoGateway: CryptoGateway;
    let classeService: ClasseService;

    const mockFileBody = Buffer.from("mock file content");

    const mockParameters: ImportClasseEnMasseTaskParameters = {
        classeId: "class-001",
        fileKey: "file-key-001",
        mapping: null,
        auteur: {
            id: "ref-001",
            email: "test@example.com",
            nom: "Test",
            prenom: "User",
        },
    };

    const mockClasseData = {
        id: "class-001",
        departement: "75",
        region: "IDF",
    };

    const mockXlsData = [
        {
            [CLASSE_IMPORT_EN_MASSE_COLUMNS.NOM]: "Doe",
            [CLASSE_IMPORT_EN_MASSE_COLUMNS.PRENOM]: "John",
            [CLASSE_IMPORT_EN_MASSE_COLUMNS.DATE_DE_NAISSANCE]: "01/01/2006",
            [CLASSE_IMPORT_EN_MASSE_COLUMNS.GENRE]: "M",
            [CLASSE_IMPORT_EN_MASSE_COLUMNS.UAI]: "12345678",
        },
        {
            [CLASSE_IMPORT_EN_MASSE_COLUMNS.NOM]: "Smith",
            [CLASSE_IMPORT_EN_MASSE_COLUMNS.PRENOM]: "Jane",
            [CLASSE_IMPORT_EN_MASSE_COLUMNS.DATE_DE_NAISSANCE]: "02/02/2006",
            [CLASSE_IMPORT_EN_MASSE_COLUMNS.GENRE]: "F",
            [CLASSE_IMPORT_EN_MASSE_COLUMNS.UAI]: "12345678",
        },
    ];

    const mockMappedXlsData = [
        {
            "Nom Eleve": "Doe",
            "Prenom Eleve": "John",
            Naissance: "01/01/2006",
            Sexe: "M",
            "Code Etablissement": "12345678",
        },
    ];

    const mockMapping = {
        [CLASSE_IMPORT_EN_MASSE_COLUMNS.NOM]: "Nom Eleve",
        [CLASSE_IMPORT_EN_MASSE_COLUMNS.PRENOM]: "Prenom Eleve",
        [CLASSE_IMPORT_EN_MASSE_COLUMNS.DATE_DE_NAISSANCE]: "Naissance",
        [CLASSE_IMPORT_EN_MASSE_COLUMNS.GENRE]: "Sexe",
        [CLASSE_IMPORT_EN_MASSE_COLUMNS.UAI]: "Code Etablissement",
    };

    beforeEach(async () => {
        const mockJeuneGateway = {
            create: jest.fn().mockImplementation((jeune) => Promise.resolve({ ...jeune, id: "young-001" })),
            update: jest.fn().mockImplementation((jeune) => Promise.resolve(jeune)),
        };

        const mockFileGateway = {
            downloadFile: jest.fn().mockResolvedValue({ Body: mockFileBody }),
            parseXLS: jest.fn(),
        };

        const mockDateNaissance = new Date("2006-01-01");
        const mockClockGateway = {
            parseDate: jest.fn().mockReturnValue(mockDateNaissance),
        };

        const mockCryptoGateway = {
            getUuid: jest.fn().mockReturnValue("12345678-1234-1234-1234-123456789012"),
        };

        const mockClasseService = {
            findById: jest.fn().mockResolvedValue(mockClasseData),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ImporterClasseEnMasse,
                { provide: JeuneGateway, useValue: mockJeuneGateway },
                { provide: FileGateway, useValue: mockFileGateway },
                { provide: ClockGateway, useValue: mockClockGateway },
                { provide: CryptoGateway, useValue: mockCryptoGateway },
                { provide: ClasseService, useValue: mockClasseService },
                { provide: Logger, useValue: { log: jest.fn() } },
            ],
        }).compile();

        importerClasseEnMasse = module.get<ImporterClasseEnMasse>(ImporterClasseEnMasse);
        jeuneGateway = module.get<JeuneGateway>(JeuneGateway);
        fileGateway = module.get<FileGateway>(FileGateway);
        clockGateway = module.get<ClockGateway>(ClockGateway);
        cryptoGateway = module.get<CryptoGateway>(CryptoGateway);
        classeService = module.get<ClasseService>(ClasseService);
    });

    it("should throw exception when parameters are missing", async () => {
        await expect(importerClasseEnMasse.execute(undefined)).rejects.toThrow(
            new FunctionalException(FunctionalExceptionCode.IMPORT_NOT_VALID),
        );
    });

    it("should throw exception when file is not found", async () => {
        (fileGateway.downloadFile as jest.Mock).mockImplementationOnce(() => Promise.resolve(null));

        await expect(importerClasseEnMasse.execute(mockParameters)).rejects.toThrow(
            new FunctionalException(FunctionalExceptionCode.NOT_FOUND),
        );
    });

    it("should successfully import jeunes without mapping", async () => {
        jest.spyOn(fileGateway, "parseXLS").mockResolvedValueOnce(mockXlsData);

        await importerClasseEnMasse.execute(mockParameters);

        expect(jeuneGateway.create).toHaveBeenCalledTimes(2);
        expect(jeuneGateway.update).toHaveBeenCalledTimes(2);

        expect(jeuneGateway.create).toHaveBeenCalledWith(
            expect.objectContaining({
                nom: "Doe",
                prenom: "John",
                genre: "M",
                classeId: "class-001",
                departement: "75",
                region: "IDF",
                statut: YOUNG_STATUS.IN_PROGRESS,
                statutPhase1: YOUNG_STATUS_PHASE1.WAITING_AFFECTATION,
                source: YOUNG_SOURCE.CLE,
            }),
        );

        expect(jeuneGateway.update).toHaveBeenCalledWith(
            expect.objectContaining({
                id: "young-001",
                statut: YOUNG_STATUS.VALIDATED,
            }),
        );
    });

    it("should successfully import jeunes with mapping", async () => {
        const parametersWithMapping = {
            ...mockParameters,
            mapping: mockMapping,
        };

        jest.spyOn(fileGateway, "parseXLS").mockResolvedValueOnce([]).mockResolvedValueOnce(mockMappedXlsData);

        await importerClasseEnMasse.execute(parametersWithMapping);

        expect(jeuneGateway.create).toHaveBeenCalledTimes(1);
        expect(jeuneGateway.update).toHaveBeenCalledTimes(1);

        expect(clockGateway.parseDate).toHaveBeenCalledWith("01/01/2006", "dd/MM/yyyy");

        expect(jeuneGateway.create).toHaveBeenCalledWith(
            expect.objectContaining({
                nom: "Doe",
                prenom: "John",
                genre: "M",
                classeId: "class-001",
            }),
        );
    });

    it("should correctly map jeunes from non-standard column names", async () => {
        const parametersWithMapping = {
            ...mockParameters,
            mapping: mockMapping,
        };

        jest.spyOn(fileGateway, "parseXLS").mockResolvedValueOnce([]).mockResolvedValueOnce(mockMappedXlsData);

        await importerClasseEnMasse.execute(parametersWithMapping);

        expect(jeuneGateway.create).toHaveBeenCalledWith(
            expect.objectContaining({
                nom: "Doe",
                prenom: "John",
                genre: "M",
            }),
        );

        expect(clockGateway.parseDate).toHaveBeenCalledWith("01/01/2006", "dd/MM/yyyy");
    });

    it("should generate email with UUID and lowercase formatting", async () => {
        jest.spyOn(fileGateway, "parseXLS").mockResolvedValueOnce([mockXlsData[0]]);
        jest.spyOn(cryptoGateway, "getUuid").mockReturnValue("abcdef12-3456-7890-abcd-ef1234567890");

        await importerClasseEnMasse.execute(mockParameters);

        expect(jeuneGateway.create).toHaveBeenCalledWith(
            expect.objectContaining({
                email: "john.doe@localhost-abcdef",
            }),
        );
    });

    it("should handle spaces in name when generating email", async () => {
        const jeuneWithSpaces = {
            ...mockXlsData[0],
            [CLASSE_IMPORT_EN_MASSE_COLUMNS.NOM]: "Doe Smith",
            [CLASSE_IMPORT_EN_MASSE_COLUMNS.PRENOM]: "John Paul",
        };

        jest.spyOn(fileGateway, "parseXLS").mockResolvedValueOnce([jeuneWithSpaces]);
        jest.spyOn(cryptoGateway, "getUuid").mockReturnValue("abcdef12-3456-7890-abcd-ef1234567890");

        await importerClasseEnMasse.execute(mockParameters);

        expect(jeuneGateway.create).toHaveBeenCalledWith(
            expect.objectContaining({
                email: "johnpaul.doesmith@localhost-abcdef",
            }),
        );
    });
});
