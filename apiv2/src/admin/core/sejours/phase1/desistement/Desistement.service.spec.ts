import { Test, TestingModule } from "@nestjs/testing";
import { DesistementService } from "./Desistement.service";
import { JeuneGateway } from "../../jeune/Jeune.gateway";
import { TaskGateway } from "@task/core/Task.gateway";
import { FileGateway } from "@shared/core/File.gateway";
import { NotificationGateway } from "@notification/core/Notification.gateway";
import { ClsService } from "nestjs-cls";
import { Logger } from "@nestjs/common";
import { JeuneModel } from "../../jeune/Jeune.model";
import { YOUNG_STATUS, YOUNG_STATUS_PHASE1 } from "snu-lib";
import { EmailTemplate } from "@notification/core/Notification";
import { AffectationService } from "../affectation/Affectation.service";
import { LigneDeBusGateway } from "../ligneDeBus/LigneDeBus.gateway";
import { SessionGateway } from "../session/Session.gateway";
import { PlanDeTransportGateway } from "../PlanDeTransport/PlanDeTransport.gateway";
import { PointDeRassemblementGateway } from "../pointDeRassemblement/PointDeRassemblement.gateway";
import { SejourGateway } from "../sejour/Sejour.gateway";
import { LigneDeBusModel } from "../ligneDeBus/LigneDeBus.model";
import { SejourModel } from "../sejour/Sejour.model";

jest.mock("@nestjs-cls/transactional", () => ({
    Transactional: () => jest.fn(),
}));

describe("DesistementService", () => {
    let service: DesistementService;
    let jeuneGateway: JeuneGateway;
    let fileGateway: FileGateway;
    let notificationGateway: NotificationGateway;
    let ligneDeBusGateway: LigneDeBusGateway;
    let affectationService: AffectationService;
    let sejourGateway: SejourGateway;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                DesistementService,
                AffectationService,
                { provide: JeuneGateway, useValue: { bulkUpdate: jest.fn() } },
                { provide: TaskGateway, useValue: { findById: jest.fn() } },
                { provide: FileGateway, useValue: { downloadFile: jest.fn(), parseXLS: jest.fn() } },
                { provide: NotificationGateway, useValue: { sendEmail: jest.fn() } },
                { provide: LigneDeBusGateway, useValue: { findByIds: jest.fn() } },
                { provide: SessionGateway, useValue: { findById: jest.fn() } },
                { provide: PlanDeTransportGateway, useValue: { findByIds: jest.fn(), bulkUpdate: jest.fn() } },
                { provide: PointDeRassemblementGateway, useValue: { findByIds: jest.fn() } },
                {
                    provide: SejourGateway,
                    useValue: { findBySessionId: jest.fn(), countPlaceOccupeesBySejourIds: jest.fn() },
                },
                { provide: ClsService, useValue: { set: jest.fn() } },
                { provide: Logger, useValue: { log: jest.fn() } },
            ],
        }).compile();

        service = module.get<DesistementService>(DesistementService);
        jeuneGateway = module.get<JeuneGateway>(JeuneGateway);
        fileGateway = module.get<FileGateway>(FileGateway);
        notificationGateway = module.get<NotificationGateway>(NotificationGateway);
        ligneDeBusGateway = module.get<LigneDeBusGateway>(LigneDeBusGateway);
        affectationService = module.get<AffectationService>(AffectationService);
        sejourGateway = module.get<SejourGateway>(SejourGateway);
    });

    describe("desisterJeunes", () => {
        it("should update lignes de bus and session occupancy when jeunes are withdrawn", async () => {
            const sejour = { id: "sejourId", sessionId: "sessionId" } as SejourModel;

            const lignesDeBus: LigneDeBusModel[] = [
                { id: "ligneDeBusId1", placesOccupeesJeunes: 2 } as LigneDeBusModel,
                { id: "ligneDeBusId2", placesOccupeesJeunes: 3 } as LigneDeBusModel,
            ];

            const jeunes: JeuneModel[] = [
                { id: "jeuneId1", statut: YOUNG_STATUS.VALIDATED, ligneDeBusId: "ligneDeBusId1" } as JeuneModel,
                { id: "jeuneId2", statut: YOUNG_STATUS.VALIDATED, ligneDeBusId: "ligneDeBusId2" } as JeuneModel,
            ];

            jest.spyOn(ligneDeBusGateway, "findByIds").mockResolvedValue(lignesDeBus);
            jest.spyOn(affectationService, "syncPlacesDisponiblesLignesDeBus").mockResolvedValue();
            jest.spyOn(jeuneGateway, "bulkUpdate").mockResolvedValue(2);
            jest.spyOn(sejourGateway, "findBySessionId").mockResolvedValue([sejour]);
            jest.spyOn(affectationService, "syncPlacesDisponiblesSejours").mockResolvedValue();

            await service.desisterJeunes(jeunes, "sessionId");

            expect(ligneDeBusGateway.findByIds).toHaveBeenCalledWith(["ligneDeBusId1", "ligneDeBusId2"]);
            expect(affectationService.syncPlacesDisponiblesLignesDeBus).toHaveBeenCalledWith(lignesDeBus);
            expect(jeuneGateway.bulkUpdate).toHaveBeenCalled();
            expect(sejourGateway.findBySessionId).toHaveBeenCalledWith("sessionId");
            expect(affectationService.syncPlacesDisponiblesSejours).toHaveBeenCalledWith([sejour]);
        });

        it("should update jeunes status to withdrawn", async () => {
            const jeunes: JeuneModel[] = [
                { id: "jeuneId1", statut: YOUNG_STATUS.VALIDATED } as JeuneModel,
                { id: "jeuneId2", statut: YOUNG_STATUS.VALIDATED } as JeuneModel,
            ];

            jest.spyOn(jeuneGateway, "bulkUpdate").mockResolvedValue(2);
            jest.spyOn(affectationService, "syncPlacesDisponiblesSejours").mockResolvedValue();

            const result = await service.desisterJeunes(jeunes, "sessionId");

            expect(result).toBe(2);
            expect(jeuneGateway.bulkUpdate).toHaveBeenCalledWith([
                {
                    ...jeunes[0],
                    statut: YOUNG_STATUS.WITHDRAWN,
                    statutPhase1: YOUNG_STATUS_PHASE1.WAITING_AFFECTATION,
                    desistementMotif: "Non confirmation de la participation au séjour",
                },
                {
                    ...jeunes[1],
                    statut: YOUNG_STATUS.WITHDRAWN,
                    statutPhase1: YOUNG_STATUS_PHASE1.WAITING_AFFECTATION,
                    desistementMotif: "Non confirmation de la participation au séjour",
                },
            ]);
        });
    });

    describe("notifierJeunes", () => {
        it("should send notification emails to jeunes and their parents", async () => {
            const jeunes: JeuneModel[] = [
                {
                    email: "jeune1@example.com",
                    prenom: "Prenom1",
                    nom: "Nom1",
                    parent1Email: "parent1@example.com",
                    parent2Email: "parent2@example.com",
                } as JeuneModel,
                { email: "jeune2@example.com", prenom: "Prenom2", nom: "Nom2" } as JeuneModel,
            ];

            const message = "Non confirmation de la participation au séjour";

            await service.notifierJeunes(jeunes);

            expect(notificationGateway.sendEmail).toHaveBeenCalledTimes(4);
            expect(notificationGateway.sendEmail).toHaveBeenCalledWith(
                { to: [{ email: "jeune1@example.com", name: "Prenom1 Nom1" }], message },
                EmailTemplate.DESISTEMENT_PAR_TIERS,
            );
            expect(notificationGateway.sendEmail).toHaveBeenCalledWith(
                { to: [{ email: "parent1@example.com", name: "Prenom1 Nom1" }], message },
                EmailTemplate.DESISTEMENT_PAR_TIERS,
            );
            expect(notificationGateway.sendEmail).toHaveBeenCalledWith(
                { to: [{ email: "parent2@example.com", name: "Prenom1 Nom1" }], message },
                EmailTemplate.DESISTEMENT_PAR_TIERS,
            );
            expect(notificationGateway.sendEmail).toHaveBeenCalledWith(
                { to: [{ email: "jeune2@example.com", name: "Prenom2 Nom2" }], message },
                EmailTemplate.DESISTEMENT_PAR_TIERS,
            );
        });
    });

    describe("groupJeunesByReponseAuxAffectations", () => {
        it("should group jeunes by categories", () => {
            const jeunes: JeuneModel[] = [
                { sessionId: "sessionId1", statut: YOUNG_STATUS.WITHDRAWN, youngPhase1Agreement: "true" } as JeuneModel,
                {
                    sessionId: "sessionId1",
                    statut: YOUNG_STATUS.VALIDATED,
                    youngPhase1Agreement: "false",
                } as JeuneModel,
                { sessionId: "sessionId2", statut: YOUNG_STATUS.VALIDATED, youngPhase1Agreement: "true" } as JeuneModel,
            ];

            const result = service.groupJeunesByReponseAuxAffectations(jeunes, "sessionId1");

            expect(result).toEqual({
                jeunesAutreSession: [jeunes[2]],
                jeunesDesistes: [jeunes[0]],
                jeunesConfirmes: [],
                jeunesNonConfirmes: [jeunes[1]],
            });
        });
    });
});
