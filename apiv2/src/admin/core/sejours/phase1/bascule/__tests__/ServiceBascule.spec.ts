import { BasculeService } from "../Bascule.service";
import { YOUNG_SOURCE, CLE_FILIERE, YOUNG_SITUATIONS } from "snu-lib";
import { NoteType } from "@admin/core/sejours/jeune/Jeune.model";
import { NotificationGateway } from "@notification/core/Notification.gateway";
import { ReferentGateway } from "@admin/core/iam/Referent.gateway";
import { EmailTemplate } from "@notification/core/Notification";
import configuration from "@config/configuration";

jest.mock("@config/configuration", () => ({
    __esModule: true,
    default: jest.fn(() => ({
        urls: {
            admin: "https://admin.test.com",
            app: "https://app.test.com",
        },
    })),
}));

describe("BasculeService", () => {
    describe("BasculeService.generateYoungNoteForBascule", () => {
        const mockDate = new Date();

        const baseProps = {
            jeune: {
                sessionNom: "Cohorte A",
                source: YOUNG_SOURCE.VOLONTAIRE,
                centreId: "123",
                sejourId: "456",
                pointDeRassemblementId: "789",
                presenceJDM: "Présent",
            },
            session: {
                nom: "Cohorte B",
            },
            sessionChangeReason: "Changement de situation",
            previousClasse: {
                uniqueKeyAndId: "CL123",
                nom: "Classe 1",
            },
            previousEtablissement: {
                nom: "Établissement X",
            },
            newSource: YOUNG_SOURCE.CLE,
            user: {
                id: "U001",
                prenom: "John",
                nom: "Doe",
                role: "Admin",
            },
        };

        it("should generate a note with full details", () => {
            const result: NoteType = BasculeService.generateYoungNoteForBascule(baseProps as any);

            expect(result.note).toContain("Changement de cohorte de Cohorte A (VOLONTAIRE) à Cohorte B (CLE)");
            expect(result.note).toContain("pour la raison suivante : Changement de situation");
            expect(result.note).toContain("Etablissement précédent : Établissement X.");
            expect(result.note).toContain("Classe précédente : CL123 Classe 1.");
            expect(result.note).toContain("Centre précédent : 123.");
            expect(result.note).toContain("Session précédente : 456.");
            expect(result.note).toContain("Point de rendez-vous précédent : 789.");
            expect(result.note).toContain("Présence JDM précédente : Présent.");

            expect(result.phase).toBe("PHASE_1");
            expect(result.referent).toEqual({
                _id: "U001",
                firstName: "John",
                lastName: "Doe",
                role: "Admin",
            });
        });

        it("should handle missing optional fields gracefully", () => {
            const propsWithMissingFields = {
                ...baseProps,
                sessionChangeReason: null,
                previousClasse: null,
                previousEtablissement: null,
                jeune: {
                    ...baseProps.jeune,
                    centreId: undefined,
                    sejourId: undefined,
                    pointDeRassemblementId: undefined,
                    presenceJDM: undefined,
                },
            };

            const result: NoteType = BasculeService.generateYoungNoteForBascule(propsWithMissingFields as any);

            expect(result.note).toContain("Changement de cohorte de Cohorte A (VOLONTAIRE) à Cohorte B (CLE)");
            expect(result.note).not.toContain("pour la raison suivante"); // No reason should be present
            expect(result.note).not.toContain("Etablissement précédent"); // No établissement
            expect(result.note).not.toContain("Classe précédente"); // No classe
            expect(result.note).not.toContain("Centre précédent"); // No centre
            expect(result.note).not.toContain("Session précédente"); // No sejour
            expect(result.note).not.toContain("Point de rendez-vous précédent"); // No point de rassemblement
            expect(result.note).not.toContain("Présence JDM précédente"); // No JDM presence
        });

        it('should use "VOLONTAIRE" as default source if jeune.source is missing', () => {
            const propsWithMissingSource = {
                ...baseProps,
                jeune: { ...baseProps.jeune, source: undefined },
            };

            const result: NoteType = BasculeService.generateYoungNoteForBascule(propsWithMissingSource as any);

            expect(result.note).toContain("Changement de cohorte de Cohorte A (VOLONTAIRE) à Cohorte B (CLE)");
        });
    });

    describe("BasculeService.generateNotificationForBascule", () => {
        let basculeService: BasculeService;
        let notificationGateway: NotificationGateway;
        let referentGateway: ReferentGateway;

        beforeEach(() => {
            jest.resetModules();

            notificationGateway = {
                sendEmail: jest.fn(),
            } as unknown as jest.Mocked<NotificationGateway>;

            referentGateway = {
                findByIds: jest.fn(),
            } as unknown as jest.Mocked<ReferentGateway>;

            basculeService = new BasculeService(referentGateway, notificationGateway);
        });

        it("should send email notifications to referents when jeune is CLE", async () => {
            (referentGateway.findByIds as jest.Mock).mockResolvedValue([
                { prenom: "Alice", nom: "Dupont", email: "alice@example.com" },
            ]);

            const jeune = { prenom: "John", nom: "Doe", source: "CLE" };
            const session = { nom: "Cohorte B" };
            const classe = { nom: "Classe 1", uniqueKeyAndId: "CL123", id: "CLASS001", referentClasseIds: ["R001"] };

            await basculeService.generateNotificationForBascule({
                jeune,
                originaleSource: "VOLONTAIRE",
                session,
                sessionChangeReason: "Changement de situation",
                message: "Some message",
                classe,
            } as any);

            /*             expect(notificationGateway.sendEmail).toHaveBeenCalledWith(
                expect.objectContaining({
                    to: [{ name: "Alice Dupont", email: "alice@example.com" }],
                    firstname: "John",
                    name: "Doe",
                    class_name: "Classe 1",
                    class_code: "CL123",
                    cta: "https://admin.test.com/classes/CLASS001",
                }),
                EmailTemplate.JEUNE_CHANGE_SESSION_TO_CLE,
            ); */
            expect(notificationGateway.sendEmail).toHaveBeenNthCalledWith(
                1,
                expect.objectContaining({
                    to: [{ name: "Alice Dupont", email: "alice@example.com" }],
                    firstname: "John",
                    name: "Doe",
                    class_name: "Classe 1",
                    class_code: "CL123",
                    cta: "https://admin.test.com/classes/CLASS001",
                }),
                EmailTemplate.JEUNE_CHANGE_SESSION_TO_CLE,
            );
        });

        it("should send notification to parents if they authorized SNU", async () => {
            const jeune = {
                prenom: "John",
                nom: "Doe",
                source: "VOLONTAIRE",
                autorisationSNUParent1: "true",
                parent1Prenom: "Jane",
                parent1Nom: "Doe",
                parent1Email: "parent1@example.com",
                autorisationSNUParent2: "false",
            };
            const session = { nom: "Cohorte B" };

            await basculeService.generateNotificationForBascule({
                jeune,
                originaleSource: "VOLONTAIRE",
                session,
                sessionChangeReason: "Changement de situation",
                message: "Some message",
            } as any);

            expect(notificationGateway.sendEmail).toHaveBeenCalledWith(
                expect.objectContaining({
                    to: [{ name: "Jane Doe", email: "parent1@example.com" }],
                    cohort: "Cohorte B",
                    youngFirstName: "John",
                    youngName: "Doe",
                    cta: "https://app.test.com",
                }),
                EmailTemplate.JEUNE_CHANGE_SESSION_CLE_TO_HTS,
            );
        });

        it("should send notification to jeune about session change", async () => {
            const jeune = { prenom: "John", nom: "Doe", email: "jeune@example.com", source: "VOLONTAIRE" };
            const session = { nom: "Cohorte B", dateStart: "2024-01-01", dateEnd: "2024-01-10" };

            await basculeService.generateNotificationForBascule({
                jeune,
                originaleSource: "VOLONTAIRE",
                session,
                sessionChangeReason: "Changement de situation",
                message: "Some message",
            } as any);

            expect(notificationGateway.sendEmail).toHaveBeenCalledWith(
                expect.objectContaining({
                    to: [{ name: "John Doe", email: "jeune@example.com" }],
                    motif: "Changement de situation",
                    message: "Some message",
                    newcohortdate: expect.any(String),
                    oldprogram: "Volontaire hors temps scolaire (HTS)",
                    cta: "https://app.test.com",
                }),
                EmailTemplate.JEUNE_CHANGE_SESSION_CLE_TO_HTS,
            );
        });
    });

    describe("BasculeService.getYoungSituationIfCLE", () => {
        it("should return GENERAL_SCHOOL for GENERAL_AND_TECHNOLOGIC", () => {
            expect(BasculeService.getYoungSituationIfCLE(CLE_FILIERE.GENERAL_AND_TECHNOLOGIC)).toBe(
                YOUNG_SITUATIONS.GENERAL_SCHOOL,
            );
        });

        it("should return PROFESSIONAL_SCHOOL for PROFESSIONAL", () => {
            expect(BasculeService.getYoungSituationIfCLE(CLE_FILIERE.PROFESSIONAL)).toBe(
                YOUNG_SITUATIONS.PROFESSIONAL_SCHOOL,
            );
        });

        it("should return APPRENTICESHIP for APPRENTICESHIP", () => {
            expect(BasculeService.getYoungSituationIfCLE(CLE_FILIERE.APPRENTICESHIP)).toBe(
                YOUNG_SITUATIONS.APPRENTICESHIP,
            );
        });

        it("should return SPECIALIZED_SCHOOL for ADAPTED", () => {
            expect(BasculeService.getYoungSituationIfCLE(CLE_FILIERE.ADAPTED)).toBe(
                YOUNG_SITUATIONS.SPECIALIZED_SCHOOL,
            );
        });

        it("should return GENERAL_SCHOOL for MIXED", () => {
            expect(BasculeService.getYoungSituationIfCLE(CLE_FILIERE.MIXED)).toBe(YOUNG_SITUATIONS.GENERAL_SCHOOL);
        });

        it("should return the input filiere if not matching predefined cases", () => {
            expect(BasculeService.getYoungSituationIfCLE("UNKNOWN_FILIERE")).toBe("UNKNOWN_FILIERE");
        });
    });
});
