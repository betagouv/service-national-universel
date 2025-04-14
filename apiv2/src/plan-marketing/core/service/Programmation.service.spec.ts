import { Test } from "@nestjs/testing";
import { ProgrammationService } from "./Programmation.service";
import { CampagneJeuneType, DestinataireListeDiffusion, EnvoiCampagneStatut, TypeEvenement } from "snu-lib";
import { CampagneSpecifiqueModelWithoutRef } from "../Campagne.model";
import { DatesSession } from "../Programmation.model";
import { ClockGateway } from "@shared/core/Clock.gateway";
import { FunctionalException, FunctionalExceptionCode } from "@shared/core/FunctionalException";

describe("ProgrammationService", () => {
    let service: ProgrammationService;
    let clockGateway: ClockGateway;

    beforeEach(async () => {
        const mockClockGateway = {
            addDays: (date: Date, days: number) => {
                const newDate = new Date(date);
                newDate.setDate(newDate.getDate() + days);
                return newDate;
            },
        };

        const moduleRef = await Test.createTestingModule({
            providers: [
                ProgrammationService,
                {
                    provide: ClockGateway,
                    useValue: mockClockGateway,
                },
            ],
        }).compile();

        service = moduleRef.get<ProgrammationService>(ProgrammationService);
        clockGateway = moduleRef.get<ClockGateway>(ClockGateway);
    });

    describe("computeDateEnvoi", () => {
        it("should return the same campagne if no programmations", () => {
            const campagne: CampagneSpecifiqueModelWithoutRef = {
                id: "1",
                generic: false,
                cohortId: "cohort-1",
                nom: "Test Campaign",
                objet: "Test",
                templateId: 1,
                listeDiffusionId: "liste-1",
                destinataires: [DestinataireListeDiffusion.JEUNES],
                type: CampagneJeuneType.VOLONTAIRE,
                programmations: [],
                isProgrammationActive: false,
            };

            const result = service.computeDateEnvoi(campagne, {} as DatesSession);
            expect(result).toEqual(campagne);
        });

        it("should compute date for DATE_DEBUT_SEJOUR type", () => {
            const dateStart = new Date("2023-08-01");
            const datesSession: Partial<DatesSession> = {
                dateStart,
            };

            const campagne: CampagneSpecifiqueModelWithoutRef = {
                id: "1",
                generic: false,
                cohortId: "cohort-1",
                nom: "Test Campaign",
                objet: "Test",
                templateId: 1,
                listeDiffusionId: "liste-1",
                destinataires: [DestinataireListeDiffusion.JEUNES],
                type: CampagneJeuneType.VOLONTAIRE,
                isProgrammationActive: true,
                programmations: [
                    {
                        id: "1",
                        joursDecalage: -3,
                        type: TypeEvenement.DATE_DEBUT_SEJOUR,
                        createdAt: new Date(),
                    },
                ],
            };

            const result = service.computeDateEnvoi(campagne, datesSession as DatesSession);

            const expectedDate = new Date(dateStart);
            expectedDate.setDate(expectedDate.getDate() - 3);

            expect(result.programmations?.[0].envoiDate).toEqual(expectedDate);
        });

        it("should compute date for DATE_FERMETURE_INSCRIPTIONS type", () => {
            const inscriptionEndDate = new Date("2023-08-01");
            const datesSession: Partial<DatesSession> = {
                inscriptionEndDate,
            };

            const campagne: CampagneSpecifiqueModelWithoutRef = {
                id: "1",
                generic: false,
                cohortId: "cohort-1",
                nom: "Test Campaign",
                objet: "Test",
                templateId: 1,
                listeDiffusionId: "liste-1",
                destinataires: [DestinataireListeDiffusion.JEUNES],
                type: CampagneJeuneType.VOLONTAIRE,
                isProgrammationActive: true,
                programmations: [
                    {
                        id: "1",
                        joursDecalage: 2,
                        type: TypeEvenement.DATE_FERMETURE_INSCRIPTIONS,
                        createdAt: new Date(),
                    },
                ],
            };

            const result = service.computeDateEnvoi(campagne, datesSession as DatesSession);

            const expectedDate = new Date(inscriptionEndDate);
            expectedDate.setDate(expectedDate.getDate() + 2);

            expect(result.programmations?.[0].envoiDate).toEqual(expectedDate);
        });

        it("should compute date for ENVOI_PRECEDENT type", () => {
            const lastSentDate = new Date("2024-08-01");

            const campagne: CampagneSpecifiqueModelWithoutRef = {
                id: "1",
                generic: false,
                cohortId: "cohort-1",
                nom: "Test Campaign",
                objet: "Test",
                templateId: 1,
                listeDiffusionId: "liste-1",
                destinataires: [DestinataireListeDiffusion.JEUNES],
                type: CampagneJeuneType.VOLONTAIRE,
                isProgrammationActive: true,
                programmations: [
                    {
                        id: "1",
                        joursDecalage: 7,
                        type: TypeEvenement.ENVOI_PRECEDENT,
                        createdAt: new Date(),
                    },
                ],
                envois: [
                    {
                        date: new Date("2023-04-15"),
                        statut: EnvoiCampagneStatut.TERMINE,
                    },
                    {
                        date: lastSentDate,
                        statut: EnvoiCampagneStatut.TERMINE,
                    },
                    {
                        date: new Date("2023-05-15"),
                        statut: EnvoiCampagneStatut.EN_COURS,
                    },
                ],
            };

            const result = service.computeDateEnvoi(campagne, {} as DatesSession);

            const expectedDate = new Date(lastSentDate);
            expectedDate.setDate(expectedDate.getDate() + 7);

            expect(result.programmations?.[0].envoiDate).toEqual(expectedDate);
        });

        it("should use ClockGateway.addDays for ENVOI_PRECEDENT calculation", () => {
            const lastSentDate = new Date("2023-05-01");

            const campagne: CampagneSpecifiqueModelWithoutRef = {
                id: "1",
                generic: false,
                cohortId: "cohort-1",
                nom: "Test Campaign",
                objet: "Test",
                templateId: 1,
                listeDiffusionId: "liste-1",
                destinataires: [DestinataireListeDiffusion.JEUNES],
                type: CampagneJeuneType.VOLONTAIRE,
                isProgrammationActive: true,
                programmations: [
                    {
                        id: "1",
                        joursDecalage: 7,
                        type: TypeEvenement.ENVOI_PRECEDENT,
                        createdAt: new Date(),
                    },
                ],
                envois: [
                    {
                        date: lastSentDate,
                        statut: EnvoiCampagneStatut.TERMINE,
                    },
                ],
            };

            // Spy on addDays method
            jest.spyOn(clockGateway, "addDays");

            const result = service.computeDateEnvoi(campagne, {} as DatesSession);

            // Verify ClockGateway.addDays was called correctly
            expect(clockGateway.addDays).toHaveBeenCalledWith(lastSentDate, 7);

            // Verify the expected date
            const expectedDate = new Date(lastSentDate);
            expectedDate.setDate(expectedDate.getDate() + 7);
            expect(result.programmations?.[0].envoiDate).toEqual(expectedDate);
        });

        it("should handle multiple programmations", () => {
            const dateStart = new Date("2023-07-01");
            const inscriptionEndDate = new Date("2023-06-15");
            const datesSession: Partial<DatesSession> = {
                dateStart,
                inscriptionEndDate,
            };

            const campagne: CampagneSpecifiqueModelWithoutRef = {
                id: "1",
                generic: false,
                cohortId: "cohort-1",
                nom: "Test Campaign",
                objet: "Test",
                templateId: 1,
                listeDiffusionId: "liste-1",
                destinataires: [DestinataireListeDiffusion.JEUNES],
                type: CampagneJeuneType.VOLONTAIRE,
                isProgrammationActive: true,
                programmations: [
                    {
                        id: "1",
                        joursDecalage: -3,
                        type: TypeEvenement.DATE_DEBUT_SEJOUR,
                        createdAt: new Date(),
                    },
                    {
                        id: "2",
                        joursDecalage: 2,
                        type: TypeEvenement.DATE_FERMETURE_INSCRIPTIONS,
                        createdAt: new Date(),
                    },
                ],
            };

            const result = service.computeDateEnvoi(campagne, datesSession as DatesSession);

            const expectedDate1 = new Date(dateStart);
            expectedDate1.setDate(expectedDate1.getDate() - 3);

            const expectedDate2 = new Date(inscriptionEndDate);
            expectedDate2.setDate(expectedDate2.getDate() + 2);

            expect(result.programmations?.[0].envoiDate).toEqual(expectedDate1);
            expect(result.programmations?.[1].envoiDate).toEqual(expectedDate2);
        });

        it("should return undefined envoiDate if date property not found in datesSession", () => {
            const datesSession: Partial<DatesSession> = {
                dateStart: new Date("2023-07-01"),
            };

            const campagne: CampagneSpecifiqueModelWithoutRef = {
                id: "1",
                generic: false,
                cohortId: "cohort-1",
                nom: "Test Campaign",
                objet: "Test",
                templateId: 1,
                listeDiffusionId: "liste-1",
                destinataires: [DestinataireListeDiffusion.JEUNES],
                type: CampagneJeuneType.VOLONTAIRE,
                isProgrammationActive: true,
                programmations: [
                    {
                        id: "1",
                        joursDecalage: 2,
                        type: TypeEvenement.DATE_FERMETURE_INSCRIPTIONS,
                        createdAt: new Date(),
                    },
                ],
            };

            const result = service.computeDateEnvoi(campagne, datesSession as DatesSession);
            expect(result.programmations?.[0].envoiDate).toBeUndefined();
        });

        it("should throw FunctionalException when typeRegle is not found", () => {
            const campagne: CampagneSpecifiqueModelWithoutRef = {
                id: "1",
                generic: false,
                cohortId: "cohort-1",
                nom: "Test Campaign",
                objet: "Test",
                templateId: 1,
                listeDiffusionId: "liste-1",
                destinataires: [DestinataireListeDiffusion.JEUNES],
                type: CampagneJeuneType.VOLONTAIRE,
                isProgrammationActive: true,
                programmations: [
                    {
                        id: "1",
                        joursDecalage: 0,
                        type: "INVALID_TYPE" as unknown as TypeEvenement,
                        createdAt: new Date(),
                    },
                ],
            };

            expect(() => service.computeDateEnvoi(campagne, {} as DatesSession)).toThrow(FunctionalException);
        });

        it("should handle AUCUN type by not computing a date", () => {
            const customDate = new Date("2024-09-15T10:00:00.000Z");

            const campagne: CampagneSpecifiqueModelWithoutRef = {
                id: "1",
                generic: false,
                cohortId: "cohort-1",
                nom: "Test Campaign",
                objet: "Test",
                templateId: 1,
                listeDiffusionId: "liste-1",
                destinataires: [DestinataireListeDiffusion.JEUNES],
                type: CampagneJeuneType.VOLONTAIRE,
                isProgrammationActive: true,
                programmations: [
                    {
                        id: "1",
                        joursDecalage: 0,
                        type: TypeEvenement.AUCUN,
                        createdAt: new Date(),
                        envoiDate: customDate,
                    },
                ],
            };

            jest.spyOn(clockGateway, "addDays");

            const result = service.computeDateEnvoi(campagne, {} as DatesSession);

            expect(result.programmations?.[0].envoiDate).toEqual(customDate);
            expect(clockGateway.addDays).not.toHaveBeenCalled();
        });
    });

    describe("shouldProgrammationBeSent", () => {
        const startDate = new Date("2023-08-01");
        const endDate = new Date("2023-08-10");

        it("should return false if envoiDate is undefined", () => {
            const programmation = {
                id: "1",
                joursDecalage: 0,
                type: TypeEvenement.AUCUN,
                createdAt: new Date(),
                envoiDate: undefined,
            };

            const result = service.shouldProgrammationBeSent(programmation, startDate, endDate);
            expect(result).toBe(false);
        });

        it("should return false if envoiDate is before startDate", () => {
            const programmation = {
                id: "1",
                joursDecalage: 0,
                type: TypeEvenement.AUCUN,
                createdAt: new Date(),
                envoiDate: new Date("2023-07-31"),
            };

            const result = service.shouldProgrammationBeSent(programmation, startDate, endDate);
            expect(result).toBe(false);
        });

        it("should return false if envoiDate is after endDate", () => {
            const programmation = {
                id: "1",
                joursDecalage: 0,
                type: TypeEvenement.AUCUN,
                createdAt: new Date(),
                envoiDate: new Date("2023-08-11"),
            };

            const result = service.shouldProgrammationBeSent(programmation, startDate, endDate);
            expect(result).toBe(false);
        });

        it("should return true if envoiDate equals startDate and sentAt is not defined", () => {
            const programmation = {
                id: "1",
                joursDecalage: 0,
                type: TypeEvenement.AUCUN,
                createdAt: new Date(),
                envoiDate: new Date("2023-08-01"),
            };

            const result = service.shouldProgrammationBeSent(programmation, startDate, endDate);
            expect(result).toBe(true);
        });

        it("should return true if envoiDate equals endDate and sentAt is not defined", () => {
            const programmation = {
                id: "1",
                joursDecalage: 0,
                type: TypeEvenement.AUCUN,
                createdAt: new Date(),
                envoiDate: new Date("2023-08-10"),
            };

            const result = service.shouldProgrammationBeSent(programmation, startDate, endDate);
            expect(result).toBe(true);
        });

        it("should return true if envoiDate is between startDate and endDate and sentAt is not defined", () => {
            const programmation = {
                id: "1",
                joursDecalage: 0,
                type: TypeEvenement.AUCUN,
                createdAt: new Date(),
                envoiDate: new Date("2023-08-05"),
            };

            const result = service.shouldProgrammationBeSent(programmation, startDate, endDate);
            expect(result).toBe(true);
        });

        it("should return false if sentAt is defined, even if date conditions are met", () => {
            const programmation = {
                id: "1",
                joursDecalage: 0,
                type: TypeEvenement.AUCUN,
                createdAt: new Date(),
                envoiDate: new Date("2023-08-05"),
                sentAt: new Date("2023-08-05"),
            };

            const result = service.shouldProgrammationBeSent(programmation, startDate, endDate);
            expect(result).toBe(false);
        });
    });
});
