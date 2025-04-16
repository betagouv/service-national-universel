import { CampagneJeuneType, TypeEvenement } from "snu-lib";
import { CampagneMapper } from "./Campagne.mapper";
import {
    CampagneGeneriqueModel,
    CampagneModel,
    CampagneSpecifiqueModel,
    CreateCampagneGeneriqueModel,
    CreateCampagneModel,
    CreateCampagneSpecifiqueModel,
} from "../core/Campagne.model";
import { CampagneProgrammation } from "@plan-marketing/core/Programmation.model";

describe("CampagneMapper", () => {
    const mockId = "123";
    const mockDate = new Date();
    const mockProgrammations: CampagneProgrammation[] = [
        { type: TypeEvenement.AUCUN, createdAt: mockDate, joursDecalage: 0 },
    ];

    describe("toModel", () => {
        it("devrait mapper une campagne générique avec tous les champs", () => {
            const document = {
                _id: mockId,
                nom: "Test",
                objet: "Test Objet",
                contexte: "Contexte",
                templateId: 1,
                listeDiffusionId: "list-1",
                destinataires: [],
                type: CampagneJeuneType.VOLONTAIRE,
                generic: true,
                envois: [],
                programmations: mockProgrammations,
                isProgrammationActive: false,
                isArchived: false,
                createdAt: mockDate,
                updatedAt: mockDate,
            };

            const result = CampagneMapper.toModel(document);

            expect(result).toEqual({
                id: mockId,
                nom: "Test",
                objet: "Test Objet",
                contexte: "Contexte",
                templateId: 1,
                listeDiffusionId: "list-1",
                destinataires: [],
                type: CampagneJeuneType.VOLONTAIRE,
                generic: true,
                envois: [],
                programmations: mockProgrammations,
                isProgrammationActive: false,
                isArchived: false,
                createdAt: mockDate,
                updatedAt: mockDate,
            } as CampagneGeneriqueModel);
        });

        it("devrait mapper une campagne spécifique sans référence avec tous les champs + cohortId", () => {
            const document = {
                _id: mockId,
                nom: "Test",
                objet: "Test Objet",
                contexte: "Contexte",
                templateId: 1,
                listeDiffusionId: "list-1",
                destinataires: [],
                type: CampagneJeuneType.VOLONTAIRE,
                generic: false,
                cohortId: "cohort-1",
                envois: [],
                programmations: mockProgrammations,
                isProgrammationActive: false,
                isArchived: false,
                createdAt: mockDate,
                updatedAt: mockDate,
            };

            const result = CampagneMapper.toModel(document);

            expect(result).toEqual({
                id: mockId,
                nom: "Test",
                objet: "Test Objet",
                contexte: "Contexte",
                templateId: 1,
                listeDiffusionId: "list-1",
                destinataires: [],
                type: CampagneJeuneType.VOLONTAIRE,
                generic: false as const,
                cohortId: "cohort-1",
                envois: [],
                programmations: mockProgrammations,
                isProgrammationActive: false,
                isArchived: false,
                createdAt: mockDate,
                updatedAt: mockDate,
            } as CampagneSpecifiqueModel);
        });

        it("devrait mapper une campagne spécifique avec référence avec uniquement les champs minimaux", () => {
            const document = {
                _id: mockId,
                nom: "Test",
                objet: "Test Objet",
                contexte: "Contexte",
                templateId: 1,
                listeDiffusionId: "list-1",
                destinataires: [],
                type: CampagneJeuneType.VOLONTAIRE,
                generic: false,
                cohortId: "cohort-1",
                campagneGeneriqueId: "campagne-1",
                programmations: mockProgrammations,
                isProgrammationActive: false,
                isArchived: false,
                envois: [],
                createdAt: mockDate,
                updatedAt: mockDate,
            };

            const result = CampagneMapper.toModel(document);

            expect(result).toEqual({
                id: mockId,
                generic: false as const,
                cohortId: "cohort-1",
                campagneGeneriqueId: "campagne-1",
                envois: [],
                createdAt: mockDate,
                updatedAt: mockDate,
            } as CampagneSpecifiqueModel);
        });
    });

    describe("toEntity", () => {
        it("devrait convertir une campagne générique en entité avec tous les champs", () => {
            const model: CampagneGeneriqueModel = {
                id: mockId,
                nom: "Test",
                objet: "Test Objet",
                contexte: "Contexte",
                templateId: 1,
                listeDiffusionId: "list-1",
                destinataires: [],
                type: CampagneJeuneType.VOLONTAIRE,
                generic: true,
                programmations: mockProgrammations,
                isProgrammationActive: false,
                isArchived: false,
            };

            const result = CampagneMapper.toEntity(model);

            expect(result).toEqual({
                _id: mockId,
                nom: "Test",
                objet: "Test Objet",
                contexte: "Contexte",
                templateId: 1,
                listeDiffusionId: "list-1",
                destinataires: [],
                type: CampagneJeuneType.VOLONTAIRE,
                generic: true,
                cohortId: undefined,
                envois: [],
                programmations: mockProgrammations,
                isProgrammationActive: false,
                isArchived: false,
                campagneGeneriqueId: undefined,
            });
        });

        it("devrait convertir une campagne spécifique sans référence en entité avec tous les champs + cohortId", () => {
            const model: CampagneModel = {
                id: mockId,
                nom: "Test",
                objet: "Test Objet",
                contexte: "Contexte",
                templateId: 1,
                listeDiffusionId: "list-1",
                destinataires: [],
                type: CampagneJeuneType.VOLONTAIRE,
                generic: false as const,
                cohortId: "cohort-1",
                programmations: mockProgrammations,
                isProgrammationActive: false,
                isArchived: false,
            };

            const result = CampagneMapper.toEntity(model);

            expect(result).toEqual({
                _id: mockId,
                nom: "Test",
                objet: "Test Objet",
                contexte: "Contexte",
                templateId: 1,
                listeDiffusionId: "list-1",
                destinataires: [],
                type: CampagneJeuneType.VOLONTAIRE,
                generic: false,
                cohortId: "cohort-1",
                programmations: mockProgrammations,
                campagneGeneriqueId: undefined,
                originalCampagneGeneriqueId: undefined,
                envois: [],
                isProgrammationActive: false,
                isArchived: false,
            });
        });

        it("devrait convertir une campagne spécifique avec référence en entité avec uniquement les champs minimaux", () => {
            const model: CampagneSpecifiqueModel = {
                id: mockId,
                generic: false as const,
                cohortId: "cohort-1",
                campagneGeneriqueId: "campagne-1",
            };

            const result = CampagneMapper.toEntity(model);

            expect(result).toEqual({
                _id: mockId,
                generic: false,
                cohortId: "cohort-1",
                campagneGeneriqueId: "campagne-1",
            });
        });
    });

    describe("toEntityCreate", () => {
        it("devrait créer une entité pour une campagne générique avec tous les champs", () => {
            const model: CreateCampagneGeneriqueModel = {
                nom: "Test",
                objet: "Test Objet",
                contexte: "Contexte",
                templateId: 1,
                listeDiffusionId: "list-1",
                destinataires: [],
                type: CampagneJeuneType.VOLONTAIRE,
                generic: true,
                programmations: mockProgrammations,
                isProgrammationActive: false,
                isArchived: false,
            };

            const result = CampagneMapper.toEntityCreate(model);

            expect(result).toEqual({
                nom: "Test",
                objet: "Test Objet",
                contexte: "Contexte",
                templateId: 1,
                listeDiffusionId: "list-1",
                destinataires: [],
                type: CampagneJeuneType.VOLONTAIRE,
                generic: true,
                cohortId: undefined,
                programmations: mockProgrammations,
                isProgrammationActive: false,
                isArchived: false,
                campagneGeneriqueId: undefined,
            });
        });

        it("devrait créer une entité pour une campagne spécifique sans référence avec tous les champs + cohortId", () => {
            const model: CreateCampagneModel = {
                nom: "Test",
                objet: "Test Objet",
                contexte: "Contexte",
                templateId: 1,
                listeDiffusionId: "list-1",
                destinataires: [],
                type: CampagneJeuneType.VOLONTAIRE,
                generic: false as const,
                cohortId: "cohort-1",
                programmations: mockProgrammations,
                isProgrammationActive: false,
                isArchived: false,
            };

            const result = CampagneMapper.toEntityCreate(model);

            expect(result).toEqual({
                nom: "Test",
                objet: "Test Objet",
                contexte: "Contexte",
                templateId: 1,
                listeDiffusionId: "list-1",
                destinataires: [],
                type: CampagneJeuneType.VOLONTAIRE,
                generic: false,
                cohortId: "cohort-1",
                programmations: mockProgrammations,
                isProgrammationActive: false,
                isArchived: false,
                campagneGeneriqueId: undefined,
            });
        });

        it("devrait créer une entité pour une campagne spécifique avec référence avec uniquement les champs minimaux", () => {
            const model: CreateCampagneSpecifiqueModel = {
                generic: false as const,
                cohortId: "cohort-1",
                campagneGeneriqueId: "campagne-1",
                isProgrammationActive: false,
            };

            const result = CampagneMapper.toEntityCreate(model);

            expect(result).toEqual({
                generic: false,
                cohortId: "cohort-1",
                campagneGeneriqueId: "campagne-1",
                isProgrammationActive: false,
            });
        });
    });
});
