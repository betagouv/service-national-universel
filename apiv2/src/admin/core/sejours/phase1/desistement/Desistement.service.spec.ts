import { Test, TestingModule } from "@nestjs/testing";
import { DesistementService } from "./Desistement.service";
import { JeuneGateway } from "../../jeune/Jeune.gateway";
import { TaskGateway } from "@task/core/Task.gateway";
import { FileGateway } from "@shared/core/File.gateway";
import { NotificationGateway } from "@notification/core/Notification.gateway";
import { ClsService } from "nestjs-cls";
import { Logger } from "@nestjs/common";
import { JeuneModel } from "../../jeune/Jeune.model";
import { YOUNG_STATUS } from "snu-lib";
import { EmailTemplate } from "@notification/core/Notification";
import { JeuneService } from "../../jeune/Jeune.service";

jest.mock("@nestjs-cls/transactional", () => ({
    Transactional: () => jest.fn(),
}));

describe("DesistementService", () => {
    let service: DesistementService;
    let jeuneGateway: JeuneGateway;
    let fileGateway: FileGateway;
    let notificationGateway: NotificationGateway;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                DesistementService,
                JeuneService,
                { provide: JeuneGateway, useValue: { bulkUpdate: jest.fn() } },
                { provide: TaskGateway, useValue: { findById: jest.fn() } },
                { provide: FileGateway, useValue: { downloadFile: jest.fn(), parseXLS: jest.fn() } },
                { provide: NotificationGateway, useValue: { sendEmail: jest.fn() } },
                { provide: ClsService, useValue: { set: jest.fn() } },
                { provide: Logger, useValue: { log: jest.fn() } },
            ],
        }).compile();

        service = module.get<DesistementService>(DesistementService);
        jeuneGateway = module.get<JeuneGateway>(JeuneGateway);
        fileGateway = module.get<FileGateway>(FileGateway);
        notificationGateway = module.get<NotificationGateway>(NotificationGateway);
    });

    describe("desisterJeunes", () => {
        it("should update jeunes status to withdrawn", async () => {
            const jeunes: JeuneModel[] = [
                { id: "jeuneId1", statut: YOUNG_STATUS.VALIDATED } as JeuneModel,
                { id: "jeuneId2", statut: YOUNG_STATUS.VALIDATED } as JeuneModel,
            ];

            jest.spyOn(jeuneGateway, "bulkUpdate").mockResolvedValue(2);

            const result = await service.desisterJeunes(jeunes);

            expect(result).toBe(2);
            expect(jeuneGateway.bulkUpdate).toHaveBeenCalledWith([
                {
                    ...jeunes[0],
                    statut: YOUNG_STATUS.WITHDRAWN,
                    desistementMotif: "Vous n’avez pas confirmé votre participation au séjour",
                },
                {
                    ...jeunes[1],
                    statut: YOUNG_STATUS.WITHDRAWN,
                    desistementMotif: "Vous n’avez pas confirmé votre participation au séjour",
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

            await service.notifierJeunes(jeunes);

            expect(notificationGateway.sendEmail).toHaveBeenCalledTimes(4);
            expect(notificationGateway.sendEmail).toHaveBeenCalledWith(
                {
                    to: [{ email: "jeune1@example.com", name: "Prenom1 Nom1" }],
                    message: "Vous n’avez pas confirmé votre participation au séjour",
                },
                EmailTemplate.DESISTEMENT_PAR_TIERS,
            );
            expect(notificationGateway.sendEmail).toHaveBeenCalledWith(
                {
                    to: [{ email: "parent1@example.com", name: "Prenom1 Nom1" }],
                    message: "Vous n’avez pas confirmé votre participation au séjour",
                },
                EmailTemplate.DESISTEMENT_PAR_TIERS,
            );
            expect(notificationGateway.sendEmail).toHaveBeenCalledWith(
                {
                    to: [{ email: "parent2@example.com", name: "Prenom1 Nom1" }],
                    message: "Vous n’avez pas confirmé votre participation au séjour",
                },
                EmailTemplate.DESISTEMENT_PAR_TIERS,
            );
            expect(notificationGateway.sendEmail).toHaveBeenCalledWith(
                {
                    to: [{ email: "jeune2@example.com", name: "Prenom2 Nom2" }],
                    message: "Vous n’avez pas confirmé votre participation au séjour",
                },
                EmailTemplate.DESISTEMENT_PAR_TIERS,
            );
        });
    });
});
