import { Test } from "@nestjs/testing";
import { InscrireEleveManuellement } from "./InscrireEleveManuellement";
import { JeuneService } from "@admin/core/sejours/jeune/Jeune.service";
import { ClasseService } from "../Classe.service";
import { FunctionalException, FunctionalExceptionCode } from "@shared/core/FunctionalException";
import { JeuneModel, JeuneWithMinimalDataModel } from "@admin/core/sejours/jeune/Jeune.model";
import { ClasseModel } from "../Classe.model";
import { STATUS_CLASSE, STATUS_PHASE1_CLASSE, YOUNG_STATUS, YOUNG_STATUS_PHASE1 } from "snu-lib";

describe("InscrireEleveManuellement", () => {
    let useCase: InscrireEleveManuellement;
    let jeuneService: JeuneService;
    let classeService: ClasseService;

    const mockClasse: ClasseModel = {
        id: "classe-id-1",
        placesTotal: 30,
        placesPrises: 25,
        departement: "75",
        region: "Île-de-France",
        statut: "VALIDATED" as keyof typeof STATUS_CLASSE,
        statutPhase1: "DONE" as keyof typeof STATUS_PHASE1_CLASSE,
        etablissementId: "etablissement-id-1",
        referentClasseIds: [],
        uniqueKeyAndId: "uniqueKeyAndId",
        uniqueKey: "uniqueKey",
        anneeScolaire: "2023-2024",
        academie: "Paris",
        placesEstimees: 30,
        niveaux: [],
        commentaires: "",
    };

    const mockJeuneInput: JeuneWithMinimalDataModel = {
        prenom: "Jean",
        nom: "Dupont",
        dateNaissance: new Date("2005-01-15"),
        genre: "male",
    };

    const mockCreatedJeune: JeuneModel = {
        id: "jeune-id-1",
        prenom: "Jean",
        nom: "Dupont",
        dateNaissance: new Date("2005-01-15"),
        email: "jean.dupont@example.com",
        statut: YOUNG_STATUS.VALIDATED,
        statutPhase1: YOUNG_STATUS_PHASE1.WAITING_AFFECTATION,
        classeId: "classe-id-1",
        youngPhase1Agreement: "true",
    };

    beforeEach(async () => {
        const moduleRef = await Test.createTestingModule({
            providers: [
                InscrireEleveManuellement,
                {
                    provide: JeuneService,
                    useValue: {
                        exists: jest.fn(),
                        buildJeuneCleWithMinimalData: jest.fn(),
                        create: jest.fn(),
                        update: jest.fn(),
                    },
                },
                {
                    provide: ClasseService,
                    useValue: {
                        findById: jest.fn(),
                    },
                },
            ],
        }).compile();

        useCase = moduleRef.get<InscrireEleveManuellement>(InscrireEleveManuellement);
        jeuneService = moduleRef.get<JeuneService>(JeuneService);
        classeService = moduleRef.get<ClasseService>(ClasseService);
    });

    it("should successfully add a student to a class", async () => {
        // Arrange
        jest.spyOn(classeService, "findById").mockResolvedValue(mockClasse);
        jest.spyOn(jeuneService, "exists").mockResolvedValue(false);
        jest.spyOn(jeuneService, "buildJeuneCleWithMinimalData").mockReturnValue(mockCreatedJeune);
        jest.spyOn(jeuneService, "create").mockResolvedValue(mockCreatedJeune);
        jest.spyOn(jeuneService, "update").mockResolvedValue({ ...mockCreatedJeune, statut: YOUNG_STATUS.VALIDATED });

        // Act
        const result = await useCase.execute(mockJeuneInput, mockClasse.id);

        // Assert
        expect(classeService.findById).toHaveBeenCalledWith(mockClasse.id);
        expect(jeuneService.exists).toHaveBeenCalledWith(mockJeuneInput, mockClasse.id);
        expect(jeuneService.buildJeuneCleWithMinimalData).toHaveBeenCalledWith(mockJeuneInput, mockClasse);
        expect(jeuneService.create).toHaveBeenCalledWith(mockCreatedJeune);
        expect(jeuneService.update).toHaveBeenCalledWith({
            ...mockCreatedJeune,
            statut: YOUNG_STATUS.VALIDATED,
        });
        expect(result).toEqual(mockCreatedJeune);
    });

    it("should throw an exception when the class is full", async () => {
        // Arrange
        const fullClasse = { ...mockClasse, placesPrises: 30 };
        jest.spyOn(classeService, "findById").mockResolvedValue(fullClasse);

        // Act & Assert
        await expect(useCase.execute(mockJeuneInput, fullClasse.id)).rejects.toThrow(
            new FunctionalException(FunctionalExceptionCode.CLASSE_FULL),
        );
        expect(jeuneService.create).not.toHaveBeenCalled();
    });

    it("should throw an exception when the student already exists", async () => {
        // Arrange
        jest.spyOn(classeService, "findById").mockResolvedValue(mockClasse);
        jest.spyOn(jeuneService, "exists").mockResolvedValue(true);

        // Act & Assert
        await expect(useCase.execute(mockJeuneInput, mockClasse.id)).rejects.toThrow(
            new FunctionalException(FunctionalExceptionCode.JEUNE_ALREADY_EXISTS),
        );
        expect(jeuneService.create).not.toHaveBeenCalled();
    });
});
