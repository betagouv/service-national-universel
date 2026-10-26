/**
 * Rejeu du webhook d'import Brevo (H77).
 *
 * `findByMetadata` charge la tâche par `processId` sans aucune condition de statut : un même
 * appel pouvait être rejoué indéfiniment et relancer `sendCampagneNow` (envoi Brevo réel).
 * Seule une tâche encore en attente doit déclencher une action.
 */
import { Test, TestingModule } from "@nestjs/testing";
import { TaskName, TaskStatus } from "snu-lib";

import { TaskGateway } from "@task/core/Task.gateway";
import { FunctionalException } from "@shared/core/FunctionalException";

import { PlanMarketingActionSelectorService } from "./PlanMarketingActionSelector.service";
import { AssocierListeDiffusionToCampagne } from "./useCase/AssocierListeDiffusionToCampagne";
import { EnvoyerCampagne } from "./useCase/EnvoyerCampagne";

describe("PlanMarketingActionSelectorService - rejeu", () => {
    let service: PlanMarketingActionSelectorService;
    const taskGateway = { findByMetadata: jest.fn(), toSuccess: jest.fn(), toFailed: jest.fn() };
    const envoyerCampagne = { execute: jest.fn() };
    const associerListeDiffusion = { execute: jest.fn() };

    beforeEach(async () => {
        jest.clearAllMocks();
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PlanMarketingActionSelectorService,
                { provide: TaskGateway, useValue: taskGateway },
                { provide: AssocierListeDiffusionToCampagne, useValue: associerListeDiffusion },
                { provide: EnvoyerCampagne, useValue: envoyerCampagne },
            ],
        }).compile();

        service = module.get(PlanMarketingActionSelectorService);
    });

    const tache = (status: TaskStatus) => ({
        id: "tache-1",
        name: TaskName.PLAN_MARKETING_IMPORT_CONTACTS_ET_CREER_LISTE_PUIS_ENVOYER_CAMPAGNE,
        status,
        metadata: { parameters: { processId: 42, nomListe: "liste", campagneId: "c1", campagneProviderId: "p1" } },
    });

    it("exécute l'action d'une tâche en attente", async () => {
        taskGateway.findByMetadata.mockResolvedValue([tache(TaskStatus.PENDING)]);

        await service.selectAction(42);

        expect(envoyerCampagne.execute).toHaveBeenCalled();
        expect(taskGateway.toSuccess).toHaveBeenCalled();
    });

    it.each([[TaskStatus.COMPLETED], [TaskStatus.FAILED], [TaskStatus.IN_PROGRESS]])(
        "refuse de rejouer une tâche au statut %s",
        async (status) => {
            taskGateway.findByMetadata.mockResolvedValue([tache(status)]);

            await expect(service.selectAction(42)).rejects.toThrow(FunctionalException);

            expect(envoyerCampagne.execute).not.toHaveBeenCalled();
            expect(associerListeDiffusion.execute).not.toHaveBeenCalled();
            expect(taskGateway.toSuccess).not.toHaveBeenCalled();
        },
    );
});
