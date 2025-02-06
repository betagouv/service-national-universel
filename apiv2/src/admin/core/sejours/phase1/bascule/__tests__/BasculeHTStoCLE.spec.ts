import { Test, TestingModule } from "@nestjs/testing";
import { BasculeHTStoCLE } from "../useCase/BasculeHTStoCLE";
import { JeuneGateway } from "@admin/core/sejours/jeune/Jeune.gateway";
import { ClasseGateway } from "@admin/core/sejours/cle/classe/Classe.gateway";
import { EtablissementGateway } from "@admin/core/sejours/cle/etablissement/Etablissement.gateway";
import { SessionGateway } from "../../session/Session.gateway";
import { SessionService } from "../../session/Session.service";
import { BasculeService } from "../Bascule.service";
import { SejourService } from "../../sejour/Sejour.service";
import { PlanDeTransportService } from "../../PlanDeTransport/PlanDeTransport.service";
import { ClasseStateManager } from "@admin/core/sejours/cle/classe/stateManager/Classe.stateManager";
import { ChangerLaSessionDuJeunePayloadDto } from "@admin/infra/sejours/phase1/bascule/api/Bascule.validation";
import { YOUNG_SOURCE, YOUNG_STATUS, STEPS2023, YOUNG_STATUS_PHASE1 } from "snu-lib";
import { ReferentModel } from "@admin/core/iam/Referent.model";

describe("BasculeHTStoCLE", () => {
    describe("BasculeHTStoCLE.execute", () => {
        let basculeHTStoCLE: BasculeHTStoCLE;
        let jeuneGateway: JeuneGateway;
        let classeGateway: ClasseGateway;
        let etablissementGateway: EtablissementGateway;
        let sessionGateway: SessionGateway;
        let sessionService: SessionService;
        let basculeService: BasculeService;
        let sejourService: SejourService;
        let planDeTransportService: PlanDeTransportService;
        let classeStateManager: ClasseStateManager;

        beforeEach(async () => {
            const module: TestingModule = await Test.createTestingModule({
                providers: [
                    BasculeHTStoCLE,
                    { provide: JeuneGateway, useValue: { findById: jest.fn(), update: jest.fn() } },
                    { provide: ClasseGateway, useValue: { findById: jest.fn() } },
                    { provide: EtablissementGateway, useValue: { findById: jest.fn() } },
                    { provide: SessionGateway, useValue: { findById: jest.fn() } },
                    { provide: SessionService, useValue: { getFilteredSessionsForCLE: jest.fn() } },
                    { provide: BasculeService, useValue: { generateNotificationForBascule: jest.fn() } },
                    { provide: SejourService, useValue: { updatePlacesSejour: jest.fn() } },
                    { provide: PlanDeTransportService, useValue: { updateSeatsTakenInBusLine: jest.fn() } },
                    { provide: ClasseStateManager, useValue: { compute: jest.fn() } },
                ],
            }).compile();

            basculeHTStoCLE = module.get<BasculeHTStoCLE>(BasculeHTStoCLE);
            jeuneGateway = module.get<JeuneGateway>(JeuneGateway);
            classeGateway = module.get<ClasseGateway>(ClasseGateway);
            etablissementGateway = module.get<EtablissementGateway>(EtablissementGateway);
            sessionGateway = module.get<SessionGateway>(SessionGateway);
            sessionService = module.get<SessionService>(SessionService);
            basculeService = module.get<BasculeService>(BasculeService);
            sejourService = module.get<SejourService>(SejourService);
            planDeTransportService = module.get<PlanDeTransportService>(PlanDeTransportService);
            classeStateManager = module.get<ClasseStateManager>(ClasseStateManager);
        });

        it("should throw an error if payload is invalid", async () => {
            await expect(
                basculeHTStoCLE.execute("jeune-id", {} as ChangerLaSessionDuJeunePayloadDto, {} as ReferentModel),
            ).rejects.toThrow("Invalid payload");
        });

        it("should throw an error if jeune is invalid", async () => {
            (jeuneGateway.findById as jest.Mock).mockResolvedValue({ source: "OTHER_SOURCE" } as any);
            await expect(
                basculeHTStoCLE.execute(
                    "jeune-id",
                    { source: YOUNG_SOURCE.CLE, classeId: "classe-id", etablissementId: "etab-id" } as any,
                    {} as ReferentModel,
                ),
            ).rejects.toThrow("Invalid object jeune");
        });

        it("should throw an error if classe has no session", async () => {
            (jeuneGateway.findById as jest.Mock).mockResolvedValue({
                source: YOUNG_SOURCE.VOLONTAIRE,
            } as any);
            (classeGateway.findById as jest.Mock).mockResolvedValue({ sessionId: null } as any);

            await expect(
                basculeHTStoCLE.execute(
                    "jeune-id",
                    { source: YOUNG_SOURCE.CLE, classeId: "classe-id", etablissementId: "etab-id" } as any,
                    {} as ReferentModel,
                ),
            ).rejects.toThrow("Classe has no session");
        });

        it("should throw an error if classe is full", async () => {
            (jeuneGateway.findById as jest.Mock).mockResolvedValue({
                source: YOUNG_SOURCE.VOLONTAIRE,
            } as any);
            (classeGateway.findById as jest.Mock).mockResolvedValue({
                sessionId: "session-id",
                placesPrises: 10,
                placesTotal: 10,
            } as any);

            await expect(
                basculeHTStoCLE.execute(
                    "jeune-id",
                    { source: YOUNG_SOURCE.CLE, classeId: "classe-id", etablissementId: "etab-id" } as any,
                    {} as ReferentModel,
                ),
            ).rejects.toThrow("Classe is full");
        });

        it("should throw an error if session is not available", async () => {
            (jeuneGateway.findById as jest.Mock).mockResolvedValue({
                source: YOUNG_SOURCE.VOLONTAIRE,
            } as any);
            (classeGateway.findById as jest.Mock).mockResolvedValue({
                sessionId: "session-id",
                placesPrises: 5,
                placesTotal: 10,
            } as any);
            (sessionGateway.findById as jest.Mock).mockResolvedValue({ nom: "Session A" } as any);
            (sessionService.getFilteredSessionsForCLE as jest.Mock).mockResolvedValue([{ nom: "Session B" }]);

            await expect(
                basculeHTStoCLE.execute(
                    "jeune-id",
                    { source: YOUNG_SOURCE.CLE, classeId: "classe-id", etablissementId: "etab-id" } as any,
                    {} as ReferentModel,
                ),
            ).rejects.toThrow("Session not available");
        });

        it("should successfully update jeune and call necessary services", async () => {
            const jeune = {
                id: "jeune-id",
                source: YOUNG_SOURCE.VOLONTAIRE,
                classeId: "old-classe-id",
                etablissementId: "old-etab-id",
                statut: YOUNG_STATUS.IN_PROGRESS,
                etapeInscription2023: STEPS2023.DOCUMENTS,
                etapeReinscription2023: null,
                sejourId: "old-sejour-id",
                ligneDeBusId: "old-bus-id",
            } as any;
            (jeuneGateway.findById as jest.Mock).mockResolvedValue(jeune);
            (classeGateway.findById as jest.Mock)
                .mockResolvedValueOnce({
                    id: "classe-id",
                    sessionId: "session-id",
                    placesPrises: 5,
                    placesTotal: 10,
                } as any)
                .mockResolvedValueOnce({ id: "old-classe-id" } as any);
            (etablissementGateway.findById as jest.Mock)
                .mockResolvedValueOnce({ id: "etab-id", type: ["typeEtab"] } as any)
                .mockResolvedValueOnce({ id: "old-etab-id", type: ["typeOldEtab"] } as any);

            (sessionGateway.findById as jest.Mock).mockResolvedValue({ id: "session-id", nom: "Session A" } as any);
            (sessionService.getFilteredSessionsForCLE as jest.Mock).mockResolvedValue([{ nom: "Session A" }]);
            jest.spyOn(BasculeService, "generateYoungNoteForBascule").mockReturnValue({ note: "New note" });

            await basculeHTStoCLE.execute(
                "jeune-id",
                { source: YOUNG_SOURCE.CLE, classeId: "classe-id", etablissementId: "etab-id" } as any,
                {} as ReferentModel,
            );

            expect(jeuneGateway.update).toHaveBeenCalled();
            expect(classeStateManager.compute).toHaveBeenCalledTimes(1);
            expect(sejourService.updatePlacesSejour).toHaveBeenCalled();
            expect(planDeTransportService.updateSeatsTakenInBusLine).toHaveBeenCalled();
            expect(basculeService.generateNotificationForBascule).toHaveBeenCalled();
            expect(BasculeService.generateYoungNoteForBascule).toHaveBeenCalled();
        });
    });

    describe("BasculeHTStoCLE.getStatutJeuneForBasculeHTStoCLE", () => {
        it("should return IN_PROGRESS for specific statuses", () => {
            const statuses = [YOUNG_STATUS.IN_PROGRESS, YOUNG_STATUS.NOT_AUTORISED];

            statuses.forEach((status) => {
                expect(BasculeHTStoCLE.getStatutJeuneForBasculeHTStoCLE(status)).toBe(YOUNG_STATUS.IN_PROGRESS);
            });
        });

        it("should return VALIDATED if status is WAITING_LIST", () => {
            const status = YOUNG_STATUS.WAITING_LIST;
            expect(BasculeHTStoCLE.getStatutJeuneForBasculeHTStoCLE(status)).toBe(YOUNG_STATUS.VALIDATED);
        });

        it("should return WAITING_VALIDATION for any other status", () => {
            const otherStatuses = [
                YOUNG_STATUS.VALIDATED,
                YOUNG_STATUS.WAITING_VALIDATION,
                YOUNG_STATUS.WAITING_CORRECTION,
                YOUNG_STATUS.WITHDRAWN,
            ];

            otherStatuses.forEach((status) => {
                expect(BasculeHTStoCLE.getStatutJeuneForBasculeHTStoCLE(status)).toBe(YOUNG_STATUS.WAITING_VALIDATION);
            });
        });
    });

    describe("BasculeHTStoCLE.updateYoungForBasculeHTStoCLE", () => {
        it("should update all fields in the jeune object", () => {
            const jeune: Record<string, any> = {
                sessionNom: "Original Session Name",
                sessionId: 0o0,
                statut: YOUNG_STATUS.WAITING_LIST,
            };
            const statutPhase1 = YOUNG_STATUS_PHASE1.AFFECTED;
            const classe = {
                sessionNom: "Session Name",
                sessionId: 123,
                centreCohesionId: 456,
                pointDeRassemblementId: 789,
                ligneId: 101112,
                filiere: "Filiere Example",
            };
            const etablissement = {
                id: 1,
                nom: "Etablissement Name",
                type: ["Type1"],
                adresse: "Etablissement Address",
                codePostal: "12345",
                commune: "Commune Name",
                departement: "Department Name",
                region: "Region Name",
                pays: "Country Name",
            };
            const hasMeetingInformation = "true";
            const inscriptionStep = 1;
            const reinscriptionStep = 2;
            const correctionRequestsFiltered = [];
            const newNote = { note: "New note" };

            const newJeune = BasculeHTStoCLE.updateYoungForBasculeHTStoCLE(
                jeune,
                statutPhase1,
                classe,
                etablissement,
                hasMeetingInformation,
                inscriptionStep,
                reinscriptionStep,
                correctionRequestsFiltered,
                newNote,
            );

            expect(newJeune.originalSessionNom).toBe(jeune.sessionNom);
            expect(newJeune.originalSessionId).toBe(jeune.sessionId);
            expect(newJeune.statut).toBe("VALIDATED");
            expect(newJeune.statutPhase1).toBe(statutPhase1);
            expect(newJeune.sessionNom).toBe(classe.sessionNom);
            expect(newJeune.sessionId).toBe(classe.sessionId);
            expect(newJeune.centreId).toBe(classe.centreCohesionId);
            expect(newJeune.sejourId).toBe(classe.sessionId);
            expect(newJeune.etablissementId).toBe(etablissement.id);
            expect(newJeune.pointDeRassemblementId).toBe(classe.pointDeRassemblementId);
            expect(newJeune.ligneDeBusId).toBe(classe.ligneId);
            expect(newJeune.deplacementPhase1Autonomous).toBeUndefined();
            expect(newJeune.transportInfoGivenByLocal).toBeUndefined();
            expect(newJeune.cohesionStayPresence).toBeUndefined();
            expect(newJeune.presenceJDM).toBeUndefined();
            expect(newJeune.departInform).toBeUndefined();
            expect(newJeune.departSejourAt).toBeUndefined();
            expect(newJeune.departSejourMotif).toBeUndefined();
            expect(newJeune.departSejourMotifComment).toBeUndefined();
            expect(newJeune.youngPhase1Agreement).toBe("false");
            expect(newJeune.hasMeetingInformation).toBe(hasMeetingInformation);
            expect(newJeune.cohesionStayMedicalFileReceived).toBeUndefined();
            expect(newJeune.source).toBe(YOUNG_SOURCE.CLE);
            expect(newJeune.cniFiles).toEqual([]);
            expect(newJeune.fichiers).toHaveProperty("cniFiles");
            expect(newJeune.etapeInscription2023).toBe(inscriptionStep);
            expect(newJeune.etapeReinscription2023).toBe(reinscriptionStep);
            expect(newJeune.dateExpirationDernierFichierCNI).toBeUndefined();
            expect(newJeune.categorieDernierFichierCNI).toBeUndefined();
            expect(newJeune.correctionRequests).toEqual(correctionRequestsFiltered);
            expect(newJeune.scolarise).toBe("true");
            expect(newJeune.nomEtablissement).toBe(etablissement.nom);
            expect(newJeune.typeEtablissement).toBe(etablissement.type[0]);
            expect(newJeune.adresseEtablissement).toBe(etablissement.adresse);
            expect(newJeune.codePostalEtablissement).toBe(etablissement.codePostal);
            expect(newJeune.villeEtablissement).toBe(etablissement.commune);
            expect(newJeune.departementEtablissement).toBe(etablissement.departement);
            expect(newJeune.regionEtablissement).toBe(etablissement.region);
            expect(newJeune.paysEtablissement).toBe(etablissement.pays);
            expect(newJeune.ecoleRamsesId).toBeUndefined();
            expect(newJeune.notes).toContainEqual(newNote);
            expect(newJeune.hasNotes).toBe("true");
        });
    });
});
