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
import { CampagneProgrammation, CreateCampagneProgrammation } from "@plan-marketing/core/Programmation.model";
import mongoose from "mongoose";

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
                programmations: [],
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
                programmations: [],
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
                programmations: [],
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
                programmations: [],
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
                programmations: [],
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
                programmations: [],
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
                programmations: [],
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
                programmations: [],
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
                campagneGeneriqueId: undefined,
                originalCampagneGeneriqueId: undefined,
                envois: [],
                programmations: [],
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
                programmations: [],
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
                programmations: [],
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
                programmations: [],
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
                programmations: [],
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
                programmations: [],
            };

            const result = CampagneMapper.toEntityCreate(model);

            expect(result).toEqual({
                generic: false,
                cohortId: "cohort-1",
                campagneGeneriqueId: "campagne-1",
            });
        });
    });

    describe("Programmation Mapper Methods", () => {
        const mockProgrammationObjectId = new mongoose.Types.ObjectId();
        const mockProgrammationId = mockProgrammationObjectId.toString();
        const mockProgrammationDate = new Date();

        describe("toModelProgrammation", () => {
            it("should convert a CampagneProgrammationType to a CampagneProgrammation model", () => {
                const programmationType = {
                    _id: mockProgrammationObjectId,
                    joursDecalage: 5,
                    type: TypeEvenement.DATE_DEBUT_SEJOUR,
                    envoiDate: mockProgrammationDate,
                    createdAt: mockProgrammationDate,
                    sentAt: mockProgrammationDate,
                };

                const result = CampagneMapper.toModelProgrammation(programmationType);

                expect(result).toEqual({
                    id: mockProgrammationId,
                    joursDecalage: 5,
                    type: TypeEvenement[TypeEvenement.DATE_DEBUT_SEJOUR],
                    envoiDate: mockProgrammationDate,
                    createdAt: mockProgrammationDate,
                    sentAt: mockProgrammationDate,
                });
            });

            it("should handle undefined optional fields", () => {
                const programmationType = {
                    _id: mockProgrammationObjectId,
                    joursDecalage: 5,
                    type: TypeEvenement.ENVOI_PRECEDENT,
                    createdAt: mockProgrammationDate,
                };

                const result = CampagneMapper.toModelProgrammation(programmationType);

                expect(result).toEqual({
                    id: mockProgrammationId,
                    joursDecalage: 5,
                    type: TypeEvenement[TypeEvenement.ENVOI_PRECEDENT],
                    envoiDate: undefined,
                    createdAt: mockProgrammationDate,
                    sentAt: undefined,
                });
            });
        });

        describe("toEntityProgrammation", () => {
            it("should convert a CampagneProgrammation model to a CampagneProgrammationType entity", () => {
                const mockProgrammationObjectId = new mongoose.Types.ObjectId();
                const mockProgrammationId = mockProgrammationObjectId.toString();

                const programmation: CampagneProgrammation = {
                    id: mockProgrammationId,
                    joursDecalage: 3,
                    type: TypeEvenement.DATE_FIN_SEJOUR,
                    envoiDate: mockProgrammationDate,
                    createdAt: mockProgrammationDate,
                    sentAt: mockProgrammationDate,
                };

                const result = CampagneMapper.toEntityProgrammation(programmation);

                expect(result).toEqual({
                    _id: mockProgrammationObjectId,
                    joursDecalage: 3,
                    type: TypeEvenement.DATE_FIN_SEJOUR,
                    envoiDate: mockProgrammationDate,
                    createdAt: mockProgrammationDate,
                    sentAt: mockProgrammationDate,
                });
            });

            it("should handle undefined optional fields", () => {
                const mockProgrammationObjectId = new mongoose.Types.ObjectId();
                const mockProgrammationId = mockProgrammationObjectId.toString();
                const programmation: CampagneProgrammation = {
                    id: mockProgrammationId,
                    joursDecalage: 3,
                    type: TypeEvenement.AUCUN,
                    createdAt: mockProgrammationDate,
                };

                const result = CampagneMapper.toEntityProgrammation(programmation);

                expect(result).toEqual({
                    _id: mockProgrammationObjectId,
                    joursDecalage: 3,
                    type: TypeEvenement.AUCUN,
                    envoiDate: undefined,
                    createdAt: mockProgrammationDate,
                    sentAt: undefined,
                });
            });
        });

        describe("toEntityProgrammationCreate", () => {
            it("should convert a CreateCampagneProgrammation model to a CampagneProgrammationType entity for creation", () => {
                const createProgrammation: CreateCampagneProgrammation = {
                    joursDecalage: 7,
                    type: TypeEvenement.DATE_OUVERTURE_INSCRIPTIONS,
                    envoiDate: mockProgrammationDate,
                    sentAt: mockProgrammationDate,
                };

                const result = CampagneMapper.toEntityProgrammationCreate(createProgrammation);

                expect(result).toEqual({
                    joursDecalage: 7,
                    type: TypeEvenement.DATE_OUVERTURE_INSCRIPTIONS,
                    envoiDate: mockProgrammationDate,
                    sentAt: mockProgrammationDate,
                });
            });

            it("should handle undefined optional fields", () => {
                const createProgrammation: CreateCampagneProgrammation = {
                    joursDecalage: 7,
                    type: TypeEvenement.DATE_FERMETURE_INSCRIPTIONS,
                };

                const result = CampagneMapper.toEntityProgrammationCreate(createProgrammation);

                expect(result).toEqual({
                    joursDecalage: 7,
                    type: TypeEvenement.DATE_FERMETURE_INSCRIPTIONS,
                    envoiDate: undefined,
                    sentAt: undefined,
                });
            });
        });
    });
});
