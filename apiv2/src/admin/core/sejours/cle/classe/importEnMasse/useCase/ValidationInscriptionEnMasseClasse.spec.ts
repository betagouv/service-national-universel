import { Test, TestingModule } from "@nestjs/testing";
import { ConfigModule } from "@nestjs/config";
import configuration from "@config/testConfiguration";

import { ClasseGateway } from "../../Classe.gateway";

import { ValidationInscriptionEnMasseClasse } from "./ValidationInscriptionEnMasseClasse";
import { FileGateway } from "@shared/core/File.gateway";
import { Logger } from "@nestjs/common";
import { ClockGateway } from "@shared/core/Clock.gateway";
import {
    CLASSE_IMPORT_EN_MASSE_COLUMNS,
    CLASSE_IMPORT_EN_MASSE_ERRORS,
    FunctionalException,
    STATUS_CLASSE,
} from "snu-lib";
import { ClockProvider } from "@shared/infra/Clock.provider";
import { EtablissementGateway } from "../../../etablissement/Etablissement.gateway";
import { JeuneGateway } from "@admin/core/sejours/jeune/Jeune.gateway";
import { ClasseModel } from "../../Classe.model";
import { FunctionalExceptionCode } from "@shared/core/FunctionalException";
describe("ValidationFileInscriptionEnMasseClasse", () => {
    let validationInscriptionEnMasseClasse: ValidationInscriptionEnMasseClasse;
    let fileGateway: jest.Mocked<FileGateway>;
    let classeGateway: jest.Mocked<ClasseGateway>;

    const mockFile = {
        fileName: "test.xls",
        buffer: Buffer.from(""),
        mimetype: "application/vnd.ms-excel",
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [
                ConfigModule.forRoot({
                    load: [configuration],
                }),
            ],
            providers: [
                ValidationInscriptionEnMasseClasse,
                {
                    provide: ClasseGateway,
                    useValue: {
                        findById: jest.fn().mockResolvedValue({
                            statut: STATUS_CLASSE.OPEN,
                        }),
                    },
                },
                {
                    provide: EtablissementGateway,
                    useValue: {
                        findById: jest.fn().mockResolvedValue({}),
                    },
                },
                {
                    provide: JeuneGateway,
                    useValue: {
                        findByNomPrenomDateDeNaissanceAndClasseId: jest.fn().mockResolvedValue(null),
                    },
                },
                {
                    provide: FileGateway,
                    useValue: {
                        parseXLS: jest.fn(),
                        uploadFile: jest.fn().mockResolvedValue({ Key: "test-key" }),
                    },
                },
                {
                    provide: ClockGateway,
                    useClass: ClockProvider,
                },
                Logger,
            ],
        }).compile();

        validationInscriptionEnMasseClasse = module.get<ValidationInscriptionEnMasseClasse>(
            ValidationInscriptionEnMasseClasse,
        );
        fileGateway = module.get(FileGateway);
        classeGateway = module.get(ClasseGateway);
    });

    it("should return an error if the file is empty", async () => {
        fileGateway.parseXLS.mockResolvedValueOnce([]);

        const results = await validationInscriptionEnMasseClasse.execute("classeId", null, mockFile);

        expect(results.errors.find((error) => error.code === CLASSE_IMPORT_EN_MASSE_ERRORS.EMPTY_FILE)).toBeDefined();
    });

    it("should return an error if there is missing columns", async () => {
        fileGateway.parseXLS.mockResolvedValueOnce([
            {
                Nom: "John",
                Prénom: "Doe",
                "Date de naissance": "2010-01-01",
            },
        ]);

        const results = await validationInscriptionEnMasseClasse.execute("classeId", null, mockFile);

        expect(results.isValid).toEqual(false);
        expect(results.errors.length).toBeGreaterThan(0);
        expect(
            results.errors.find(
                (error) =>
                    error.code === CLASSE_IMPORT_EN_MASSE_ERRORS.MISSING_COLUMN &&
                    error.column === CLASSE_IMPORT_EN_MASSE_COLUMNS.GENRE,
            ),
        ).toBeDefined();
    });

    it("should return an error if the date format is invalid", async () => {
        fileGateway.parseXLS.mockResolvedValueOnce([
            {
                Nom: "John",
                Prénom: "Doe",
                Genre: "M",
                "Date de naissance": "2010-01-01",
                UAI: "12345678",
            },
        ]);

        const results = await validationInscriptionEnMasseClasse.execute("classeId", null, mockFile);

        expect(results.isValid).toEqual(false);
        expect(results.errors.length).toBeGreaterThan(0);
        expect(
            results.errors.find(
                (error) =>
                    error.code === CLASSE_IMPORT_EN_MASSE_ERRORS.INVALID_FORMAT &&
                    error.column === CLASSE_IMPORT_EN_MASSE_COLUMNS.DATE_DE_NAISSANCE,
            ),
        ).toBeDefined();
    });

    it("should return an error if the value format is invalid", async () => {
        fileGateway.parseXLS.mockResolvedValueOnce([
            {
                Nom: "John",
                Prénom: "Doe",
                Genre: "X",
                "Date de naissance": "01/01/2010",
                UAI: "12345678",
            },
        ]);

        const results = await validationInscriptionEnMasseClasse.execute("classeId", null, mockFile);

        expect(results.isValid).toEqual(false);
        expect(results.errors.length).toBeGreaterThan(0);
        expect(
            results.errors.find(
                (error) =>
                    error.code === CLASSE_IMPORT_EN_MASSE_ERRORS.INVALID_FORMAT &&
                    error.column === CLASSE_IMPORT_EN_MASSE_COLUMNS.GENRE,
            ),
        ).toBeDefined();
    });

    it("should return an error if the minLength format is invalid", async () => {
        fileGateway.parseXLS.mockResolvedValueOnce([
            {
                Nom: "John",
                Prénom: "Doe",
                Genre: "F",
                "Date de naissance": "01/01/2010",
                UAI: "1234567",
            },
        ]);

        const results = await validationInscriptionEnMasseClasse.execute("classeId", null, mockFile);

        expect(results.isValid).toEqual(false);
        expect(results.errors.length).toBeGreaterThan(0);
        expect(
            results.errors.find(
                (error) =>
                    error.code === CLASSE_IMPORT_EN_MASSE_ERRORS.INVALID_FORMAT &&
                    error.column === CLASSE_IMPORT_EN_MASSE_COLUMNS.UAI,
            ),
        ).toBeDefined();
    });

    it("should return an error if the maxLength format is invalid", async () => {
        fileGateway.parseXLS.mockResolvedValueOnce([
            {
                Nom: "John",
                Prénom: "Doe",
                Genre: "F",
                "Date de naissance": "01/01/2010",
                UAI: "1234567890",
            },
        ]);

        const results = await validationInscriptionEnMasseClasse.execute("classeId", null, mockFile);

        expect(results.isValid).toEqual(false);
        expect(results.errors.length).toBeGreaterThan(0);
        expect(
            results.errors.find(
                (error) =>
                    error.code === CLASSE_IMPORT_EN_MASSE_ERRORS.INVALID_FORMAT &&
                    error.column === CLASSE_IMPORT_EN_MASSE_COLUMNS.UAI,
            ),
        ).toBeDefined();
    });

    it("should succeed if the format is valid", async () => {
        fileGateway.parseXLS.mockResolvedValueOnce([
            {
                Nom: "John",
                Prénom: "Doe",
                Genre: "M",
                "Date de naissance": "01/01/2010",
            },
        ]);

        const results = await validationInscriptionEnMasseClasse.execute("classeId", null, mockFile);

        expect(results.errors.length).toEqual(0);
        expect(results.isValid).toEqual(true);
        expect(results.fileKey).toEqual("test-key");
    });

    it("should succeed if the format is valid with a mapping", async () => {
        fileGateway.parseXLS.mockResolvedValueOnce([
            {
                nom: "John",
                prenom: "Doe",
                genre: "M",
                dateNaissance: "01/01/2010",
            },
        ]);

        const results = await validationInscriptionEnMasseClasse.execute(
            "classeId",
            {
                Nom: "nom",
                Prénom: "prenom",
                Genre: "genre",
                "Date de naissance": "dateNaissance",
            },
            mockFile,
        );

        expect(results.errors.length).toEqual(0);
        expect(results.isValid).toEqual(true);
    });

    it("should throw an error if the classe is not open", async () => {
        classeGateway.findById.mockResolvedValueOnce({
            statut: STATUS_CLASSE.CLOSED,
        } as ClasseModel);

        await expect(validationInscriptionEnMasseClasse.execute("classeId", null, mockFile)).rejects.toThrow(
            FunctionalExceptionCode.CLASSE_STATUT_INVALIDE_IMPORT_EN_MASSE,
        );
    });
});
