import { Test, TestingModule } from "@nestjs/testing";
import { CampagneContactBuilderService } from "./CampagneContactBuilder.service";
import { ClockGateway } from "@shared/core/Clock.gateway";
import { ColumnType } from "../ListeDiffusion.model";
import { YoungType } from "snu-lib";
import { CentreModel } from "@admin/core/sejours/phase1/centre/Centre.model";
import { PointDeRassemblementModel } from "@admin/core/sejours/phase1/pointDeRassemblement/PointDeRassemblement.model";
import { LigneDeBusModel } from "@admin/core/sejours/phase1/ligneDeBus/LigneDeBus.model";
import { SegmentDeLigneModel } from "@admin/core/sejours/phase1/segmentDeLigne/SegmentDeLigne.model";
import { ReferentModel } from "@admin/core/iam/Referent.model";

describe("CampagneContactBuilderService", () => {
    let service: CampagneContactBuilderService;
    let mockClockGateway: any;

    const mockCentres: CentreModel[] = [
        {
            id: "centre1",
            nom: "Centre 1",
            ville: "Ville 1",
            sessionNames: [],
            sessionIds: [],
            listeAttente: [],
            statutSejour: [],
        },
        {
            id: "centre2",
            nom: "Centre 2",
            ville: "Ville 2",
            sessionNames: [],
            sessionIds: [],
            listeAttente: [],
            statutSejour: [],
        },
    ];

    const mockPointDeRassemblements: Partial<PointDeRassemblementModel>[] = [
        {
            id: "pdr1",
            nom: "PDR 1",
            adresse: "Adresse PDR 1",
            ville: "Ville PDR 1",
            code: "PDR1",
            codePostal: "75001",
            region: "Region 1",
            departement: "75",
        },
        {
            id: "pdr2",
            nom: "PDR 2",
            adresse: "Adresse PDR 2",
            ville: "Ville PDR 2",
            code: "PDR2",
            codePostal: "75002",
            region: "Region 1",
            departement: "75",
        },
    ] as PointDeRassemblementModel[];

    const mockLignes: Partial<LigneDeBusModel>[] = [
        {
            id: "ligne1",
            dateDepart: new Date("2023-06-01"),
            dateRetour: new Date("2023-06-15"),
            numeroLigne: "L1",
            capaciteJeunes: 50,
            capaciteTotal: 60,
            capaciteAccompagnateurs: 10,
        },
        {
            id: "ligne2",
            dateDepart: new Date("2023-07-01"),
            dateRetour: new Date("2023-07-15"),
            numeroLigne: "L2",
            capaciteJeunes: 50,
            capaciteTotal: 60,
            capaciteAccompagnateurs: 10,
        },
    ] as LigneDeBusModel[];

    const mockSegmentDeLignes: Partial<SegmentDeLigneModel>[] = [
        {
            id: "segment1",
            ligneDeBusId: "ligne1",
            heureDepart: "08:00",
            heureRetour: "18:00",
            pointDeRassemblementId: "pdr1",
            heureRencontre: "07:30",
            typeTransport: "BUS",
        },
        {
            id: "segment2",
            ligneDeBusId: "ligne2",
            heureDepart: "09:00",
            heureRetour: "19:00",
            pointDeRassemblementId: "pdr2",
            heureRencontre: "08:30",
            typeTransport: "BUS",
        },
    ] as SegmentDeLigneModel[];

    const mockYoung = {
        id: "young1",
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        cohort: "Cohort 2023",
        cohesionCenterId: "centre1",
        meetingPointId: "pdr1",
        ligneId: "ligne1",
        parent1FirstName: "Parent1First",
        parent1LastName: "Parent1Last",
        parent1Email: "parent1@example.com",
        parent2FirstName: "Parent2First",
        parent2LastName: "Parent2Last",
        parent2Email: "parent2@example.com",
    } as unknown as YoungType;

    const mockReferent: ReferentModel = {
        id: "referent1",
        prenom: "Jane",
        nom: "Smith",
        email: "jane.smith@example.com",
        region: "Region 1",
        metadata: { isFirstInvitationPending: false },
        invitationToken: "token123",
    };

    beforeEach(async () => {
        mockClockGateway = {
            isValidDate: jest.fn((date) => date instanceof Date && !isNaN(date.getTime())),
            formatShort: jest.fn((date) => {
                if (date instanceof Date) {
                    return date.toLocaleDateString("fr-FR");
                }
                return "";
            }),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CampagneContactBuilderService,
                {
                    provide: ClockGateway,
                    useValue: mockClockGateway,
                },
            ],
        }).compile();

        service = module.get<CampagneContactBuilderService>(CampagneContactBuilderService);
    });

    describe("buildYoungContactRow", () => {
        it("should create a contact row for a young", () => {
            const result = service.buildYoungContactRow(
                mockYoung,
                mockCentres,
                mockPointDeRassemblements as PointDeRassemblementModel[],
                mockLignes as LigneDeBusModel[],
                mockSegmentDeLignes as SegmentDeLigneModel[],
            );

            expect(result).toEqual({
                type: ColumnType.jeunes,
                PRENOM: "John",
                NOM: "Doe",
                EMAIL: "john.doe@example.com",
                COHORT: "Cohort 2023",
                CENTRE: "Centre 1",
                VILLECENTRE: "Ville 1",
                PRENOMVOLONTAIRE: "John",
                NOMVOLONTAIRE: "Doe",
                PDR_ALLER: "PDR 1",
                PDR_ALLER_ADRESSE: "Adresse PDR 1",
                PDR_ALLER_VILLE: "Ville PDR 1",
                PDR_RETOUR: "PDR 1",
                PDR_RETOUR_VILLE: "Ville PDR 1",
                PDR_RETOUR_ADRESSE: "Adresse PDR 1",
                DATE_ALLER: "01/06/2023",
                HEURE_ALLER: "08:00",
                DATE_RETOUR: "15/06/2023",
                HEURE_RETOUR: "18:00",
                PRENOM_RL1: "",
                NOM_RL1: "",
                PRENOM_RL2: "",
                NOM_RL2: "",
                EMAIL_DE_CONNEXION: "john.doe@example.com",
            });

            expect(mockClockGateway.isValidDate).toHaveBeenCalledTimes(2);
            expect(mockClockGateway.formatShort).toHaveBeenCalledTimes(2);
        });

        it("should handle missing data gracefully", () => {
            const incompleteYoung = {
                ...mockYoung,
                cohesionCenterId: "nonexistent",
                meetingPointId: "nonexistent",
                ligneId: "nonexistent",
            };

            const result = service.buildYoungContactRow(
                incompleteYoung,
                mockCentres,
                mockPointDeRassemblements as PointDeRassemblementModel[],
                mockLignes as LigneDeBusModel[],
                mockSegmentDeLignes as SegmentDeLigneModel[],
            );

            expect(result.CENTRE).toBeUndefined();
            expect(result.VILLECENTRE).toBeUndefined();
            expect(result.PDR_ALLER).toBeUndefined();
            expect(result.DATE_ALLER).toBe("");
            expect(result.HEURE_ALLER).toBeUndefined();
        });
    });

    describe("buildParentContactRow", () => {
        it("should create a contact row for parent1", () => {
            const baseRow = service.buildYoungContactRow(
                mockYoung,
                mockCentres,
                mockPointDeRassemblements as PointDeRassemblementModel[],
                mockLignes as LigneDeBusModel[],
                mockSegmentDeLignes as SegmentDeLigneModel[],
            );

            const result = service.buildParentContactRow(baseRow, mockYoung, true);

            expect(result.type).toBe(ColumnType.representants);
            expect(result.PRENOM_RL1).toBe("Parent1First");
            expect(result.NOM_RL1).toBe("Parent1Last");
            expect(result.PRENOM_RL2).toBe("");
            expect(result.NOM_RL2).toBe("");
            expect(result.EMAIL).toBe("parent1@example.com");
            expect(result.EMAIL_DE_CONNEXION).toBe("john.doe@example.com");
        });

        it("should create a contact row for parent2", () => {
            const baseRow = service.buildYoungContactRow(
                mockYoung,
                mockCentres,
                mockPointDeRassemblements as PointDeRassemblementModel[],
                mockLignes as LigneDeBusModel[],
                mockSegmentDeLignes as SegmentDeLigneModel[],
            );

            const result = service.buildParentContactRow(baseRow, mockYoung, false);

            expect(result.type).toBe(ColumnType.representants);
            expect(result.PRENOM_RL1).toBe("");
            expect(result.NOM_RL1).toBe("");
            expect(result.PRENOM_RL2).toBe("Parent2First");
            expect(result.NOM_RL2).toBe("Parent2Last");
            expect(result.EMAIL).toBe("parent2@example.com");
            expect(result.EMAIL_DE_CONNEXION).toBe("john.doe@example.com");
        });
    });

    describe("buildReferentContactRow", () => {
        it("should create a contact row for a referent", () => {
            const baseRow = service.buildYoungContactRow(
                mockYoung,
                mockCentres,
                mockPointDeRassemblements as PointDeRassemblementModel[],
                mockLignes as LigneDeBusModel[],
                mockSegmentDeLignes as SegmentDeLigneModel[],
            );

            const result = service.buildReferentContactRow(baseRow, mockReferent, ColumnType.referents);

            expect(result.type).toBe(ColumnType.referents);
            expect(result.PRENOM).toBe("Jane");
            expect(result.NOM).toBe("Smith");
            expect(result.EMAIL).toBe("jane.smith@example.com");
        });
    });

    describe("buildChefEtablissementContactRow", () => {
        it("should create a contact row for a chef etablissement", () => {
            const baseRow = service.buildYoungContactRow(
                mockYoung,
                mockCentres,
                mockPointDeRassemblements as PointDeRassemblementModel[],
                mockLignes as LigneDeBusModel[],
                mockSegmentDeLignes as SegmentDeLigneModel[],
            );

            const result = service.buildChefEtablissementContactRow(baseRow, mockReferent);

            expect(result.type).toBe(ColumnType["chefs-etablissement"]);
            expect(result.PRENOM).toBe("Jane");
            expect(result.NOM).toBe("Smith");
            expect(result.EMAIL).toBe("jane.smith@example.com");
        });
    });

    describe("buildChefCentreContactRow", () => {
        it("should create a contact row for a chef centre", () => {
            const baseRow = service.buildYoungContactRow(
                mockYoung,
                mockCentres,
                mockPointDeRassemblements as PointDeRassemblementModel[],
                mockLignes as LigneDeBusModel[],
                mockSegmentDeLignes as SegmentDeLigneModel[],
            );

            const result = service.buildChefCentreContactRow(baseRow, mockReferent);

            expect(result.type).toBe(ColumnType["chefs-centres"]);
            expect(result.PRENOM).toBe("Jane");
            expect(result.NOM).toBe("Smith");
            expect(result.EMAIL).toBe("jane.smith@example.com");
        });
    });

    describe("buildCoordinateurCleContactRow", () => {
        it("should create a contact row for a coordinateur CLE", () => {
            const baseRow = service.buildYoungContactRow(
                mockYoung,
                mockCentres,
                mockPointDeRassemblements as PointDeRassemblementModel[],
                mockLignes as LigneDeBusModel[],
                mockSegmentDeLignes as SegmentDeLigneModel[],
            );

            const result = service.buildCoordinateurCleContactRow(baseRow, mockReferent);

            expect(result.type).toBe(ColumnType.administrateurs);
            expect(result.PRENOM).toBe("Jane");
            expect(result.NOM).toBe("Smith");
            expect(result.EMAIL).toBe("jane.smith@example.com");
        });
    });
});
