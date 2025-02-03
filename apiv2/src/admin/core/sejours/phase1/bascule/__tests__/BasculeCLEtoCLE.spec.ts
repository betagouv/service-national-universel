import { Test, TestingModule } from "@nestjs/testing";
import { BasculeCLEtoCLE } from "../useCase/BasculeCLEtoCLE";
import { JeuneGateway } from "@admin/core/sejours/jeune/Jeune.gateway";
import { ClasseGateway } from "@admin/core/sejours/cle/classe/Classe.gateway";
import { EtablissementGateway } from "@admin/core/sejours/cle/etablissement/Etablissement.gateway";
import { SessionGateway } from "../../session/Session.gateway";
import { SessionService } from "../../session/Session.service";
import { BasculeService } from "../Bascule.service";
import { SejourService } from "../../sejour/Sejour.Service";
import { PlanDeTransportService } from "../../PlanDeTransport/PlanDeTransport.service";
import { ClasseStateManager } from "@admin/core/sejours/cle/classe/stateManager/Classe.stateManager";
import { ChangerLaSessionDuJeunePayloadDto } from "@admin/infra/sejours/phase1/bascule/api/Bascule.validation";
import { YOUNG_SOURCE, YOUNG_STATUS, STEPS2023, YOUNG_STATUS_PHASE1 } from "snu-lib";
import { ReferentModel } from "@admin/core/iam/Referent.model";

describe("BasculeCLEtoCLE", () => {
    describe("BasculeCLEtoCLE.execute", () => {
        let basculeCLEtoCLE: BasculeCLEtoCLE;
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
                    BasculeCLEtoCLE,
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

            basculeCLEtoCLE = module.get<BasculeCLEtoCLE>(BasculeCLEtoCLE);
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
                basculeCLEtoCLE.execute("jeune-id", {} as ChangerLaSessionDuJeunePayloadDto, {} as ReferentModel),
            ).rejects.toThrow("Invalid payload");
        });

        it("should throw an error if jeune is invalid", async () => {
            (jeuneGateway.findById as jest.Mock).mockResolvedValue({ source: "OTHER_SOURCE" } as any);
            await expect(
                basculeCLEtoCLE.execute(
                    "jeune-id",
                    { source: YOUNG_SOURCE.CLE, classeId: "classe-id", etablissementId: "etab-id" } as any,
                    {} as ReferentModel,
                ),
            ).rejects.toThrow("Invalid object jeune");
        });

        it("should throw an error if classe has no session", async () => {
            (jeuneGateway.findById as jest.Mock).mockResolvedValue({
                source: YOUNG_SOURCE.CLE,
                classeId: "classe-id",
                etablissementId: "etab-id",
            } as any);
            (classeGateway.findById as jest.Mock).mockResolvedValue({ sessionId: null } as any);

            await expect(
                basculeCLEtoCLE.execute(
                    "jeune-id",
                    { source: YOUNG_SOURCE.CLE, classeId: "classe-id", etablissementId: "etab-id" } as any,
                    {} as ReferentModel,
                ),
            ).rejects.toThrow("Classe has no session");
        });

        it("should throw an error if classe is full", async () => {
            (jeuneGateway.findById as jest.Mock).mockResolvedValue({
                source: YOUNG_SOURCE.CLE,
                classeId: "classe-id",
                etablissementId: "etab-id",
            } as any);
            (classeGateway.findById as jest.Mock).mockResolvedValue({
                sessionId: "session-id",
                placesPrises: 10,
                placesTotal: 10,
            } as any);

            await expect(
                basculeCLEtoCLE.execute(
                    "jeune-id",
                    { source: YOUNG_SOURCE.CLE, classeId: "classe-id", etablissementId: "etab-id" } as any,
                    {} as ReferentModel,
                ),
            ).rejects.toThrow("Classe is full");
        });

        it("should throw an error if session is not available", async () => {
            (jeuneGateway.findById as jest.Mock).mockResolvedValue({
                source: YOUNG_SOURCE.CLE,
                classeId: "classe-id",
                etablissementId: "etab-id",
            } as any);
            (classeGateway.findById as jest.Mock).mockResolvedValue({
                sessionId: "session-id",
                placesPrises: 5,
                placesTotal: 10,
            } as any);
            (sessionGateway.findById as jest.Mock).mockResolvedValue({ nom: "Session A" } as any);
            (sessionService.getFilteredSessionsForCLE as jest.Mock).mockResolvedValue([{ nom: "Session B" }]);

            await expect(
                basculeCLEtoCLE.execute(
                    "jeune-id",
                    { source: YOUNG_SOURCE.CLE, classeId: "classe-id", etablissementId: "etab-id" } as any,
                    {} as ReferentModel,
                ),
            ).rejects.toThrow("Session not available");
        });

        it("should successfully update jeune and call necessary services", async () => {
            const jeune = {
                source: YOUNG_SOURCE.CLE,
                classeId: "old-classe-id",
                etablissementId: "old-etab-id",
                statut: YOUNG_STATUS.IN_PROGRESS,
                etapeInscription2023: STEPS2023.DOCUMENTS,
                etapeReinscription2023: null,
                sejourId: "old-sejour-id",
                ligneDeBusId: "old-bus-id",
            } as any;
            (jeuneGateway.findById as jest.Mock).mockResolvedValue(jeune);
            (classeGateway.findById as jest.Mock).mockResolvedValueOnce({ id: "old-classe-id" } as any);
            (classeGateway.findById as jest.Mock).mockResolvedValueOnce({
                id: "classe-id",
                sessionId: "session-id",
                placesPrises: 5,
                placesTotal: 10,
            } as any);
            (sessionGateway.findById as jest.Mock).mockResolvedValue({ nom: "Session A" } as any);
            (sessionService.getFilteredSessionsForCLE as jest.Mock).mockResolvedValue([{ nom: "Session A" }]);
            (etablissementGateway.findById as jest.Mock).mockResolvedValue({} as any);

            await basculeCLEtoCLE.execute(
                "jeune-id",
                { source: YOUNG_SOURCE.CLE, classeId: "classe-id", etablissementId: "etab-id" } as any,
                {} as ReferentModel,
            );

            expect(jeuneGateway.update).toHaveBeenCalled();
            expect(classeStateManager.compute).toHaveBeenCalledTimes(2);
            expect(sejourService.updatePlacesSejour).toHaveBeenCalled();
            expect(planDeTransportService.updateSeatsTakenInBusLine).toHaveBeenCalled();
            expect(basculeService.generateNotificationForBascule).toHaveBeenCalled();
        });

        describe("BasculeCLEtoCLE.getStatutJeuneForBasculeCLEtoCLE", () => {
            it("should return IN_PROGRESS for specific statuses", () => {
                const statuses = [
                    YOUNG_STATUS.IN_PROGRESS,
                    YOUNG_STATUS.REFUSED,
                    YOUNG_STATUS.WITHDRAWN,
                    YOUNG_STATUS.REINSCRIPTION,
                    YOUNG_STATUS.NOT_AUTORISED,
                    YOUNG_STATUS.ABANDONED,
                    YOUNG_STATUS.DELETED,
                ];

                statuses.forEach((status) => {
                    expect(BasculeCLEtoCLE.getStatutJeuneForBasculeCLEtoCLE(status)).toBe(YOUNG_STATUS.IN_PROGRESS);
                });
            });

            it("should return WAITING_VALIDATION for any other status", () => {
                const otherStatuses = [
                    YOUNG_STATUS.VALIDATED,
                    YOUNG_STATUS.WAITING_VALIDATION,
                    YOUNG_STATUS.WAITING_CORRECTION,
                    YOUNG_STATUS.WAITING_LIST,
                ];

                otherStatuses.forEach((status) => {
                    expect(BasculeCLEtoCLE.getStatutJeuneForBasculeCLEtoCLE(status)).toBe(
                        YOUNG_STATUS.WAITING_VALIDATION,
                    );
                });
            });
        });

        describe("BasculeCLEtoCLE.updateYoungForBasculeCLEtoCLE", () => {
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

                BasculeCLEtoCLE.updateYoungForBasculeCLEtoCLE(
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

                expect(jeune.originalSessionNom).toBe(jeune.sessionNom);
                expect(jeune.originalSessionId).toBe(jeune.sessionId);
                expect(jeune.statut).toBe(BasculeCLEtoCLE.getStatutJeuneForBasculeCLEtoCLE(jeune.statut));
                expect(jeune.statutPhase1).toBe(statutPhase1);
                expect(jeune.sessionNom).toBe(classe.sessionNom);
                expect(jeune.sessionId).toBe(classe.sessionId);
                expect(jeune.centreId).toBe(classe.centreCohesionId);
                expect(jeune.sejourId).toBe(classe.sessionId);
                expect(jeune.etablissementId).toBe(etablissement.id);
                expect(jeune.pointDeRassemblementId).toBe(classe.pointDeRassemblementId);
                expect(jeune.ligneDeBusId).toBe(classe.ligneId);
                expect(jeune.deplacementPhase1Autonomous).toBeUndefined();
                expect(jeune.transportInfoGivenByLocal).toBeUndefined();
                expect(jeune.cohesionStayPresence).toBeUndefined();
                expect(jeune.presenceJDM).toBeUndefined();
                expect(jeune.departInform).toBeUndefined();
                expect(jeune.departSejourAt).toBeUndefined();
                expect(jeune.departSejourMotif).toBeUndefined();
                expect(jeune.departSejourMotifComment).toBeUndefined();
                expect(jeune.youngPhase1Agreement).toBe("false");
                expect(jeune.hasMeetingInformation).toBe(hasMeetingInformation);
                expect(jeune.cohesionStayMedicalFileReceived).toBeUndefined();
                expect(jeune.source).toBe(YOUNG_SOURCE.CLE);
                expect(jeune.cniFiles).toEqual([]);
                expect(jeune.fichiers).toHaveProperty("cniFiles");
                expect(jeune.etapeInscription2023).toBe(inscriptionStep);
                expect(jeune.etapeReinscription2023).toBe(reinscriptionStep);
                expect(jeune.dateExpirationDernierFichierCNI).toBeUndefined();
                expect(jeune.categorieDernierFichierCNI).toBeUndefined();
                expect(jeune.correctionRequests).toEqual(correctionRequestsFiltered);
                expect(jeune.scolarise).toBe("true");
                expect(jeune.nomEtablissement).toBe(etablissement.nom);
                expect(jeune.typeEtablissement).toBe(etablissement.type[0]);
                expect(jeune.adresseEtablissement).toBe(etablissement.adresse);
                expect(jeune.codePostalEtablissement).toBe(etablissement.codePostal);
                expect(jeune.villeEtablissement).toBe(etablissement.commune);
                expect(jeune.departementEtablissement).toBe(etablissement.departement);
                expect(jeune.regionEtablissement).toBe(etablissement.region);
                expect(jeune.paysEtablissement).toBe(etablissement.pays);
                expect(jeune.ecoleRamsesId).toBeUndefined();
                expect(jeune.situation).toBe(BasculeService.getYoungSituationIfCLE(classe.filiere || ""));
                expect(jeune.notes).toContainEqual(newNote);
                expect(jeune.hasNotes).toBe("true");
            });
        });
    });
});
