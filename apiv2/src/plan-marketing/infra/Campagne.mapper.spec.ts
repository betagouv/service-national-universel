import { CampagneJeuneType } from "snu-lib";
import { CampagneMapper } from "./Campagne.mapper";
import {
    CampagneGeneriqueModel,
    CampagneModel,
    CampagneSpecifiqueModel,
    CreateCampagneGeneriqueModel,
    CreateCampagneModel,
    CreateCampagneSpecifiqueModel,
} from "../core/Campagne.model";

describe("CampagneMapper", () => {
    const mockId = "123";
    const mockDate = new Date();

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
                campagneGeneriqueId: undefined,
                originalCampagneGeneriqueId: undefined,
                envois: [],
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
                campagneGeneriqueId: undefined,
            });
        });

        it("devrait créer une entité pour une campagne spécifique avec référence avec uniquement les champs minimaux", () => {
            const model: CreateCampagneSpecifiqueModel = {
                generic: false as const,
                cohortId: "cohort-1",
                campagneGeneriqueId: "campagne-1",
            };

            const result = CampagneMapper.toEntityCreate(model);

            expect(result).toEqual({
                generic: false,
                cohortId: "cohort-1",
                campagneGeneriqueId: "campagne-1",
            });
        });
    });
});
