import { Logger } from "@nestjs/common";

import { ReferentielTaskType, TaskName } from "snu-lib";

import { ConsumerResponse } from "@shared/infra/ConsumerResponse";

import { ADMIN_TASKS_SUPPRIMEES, AdminTaskConsumer } from "./AdminTask.consumer";
import { AdminTaskImportReferentielSelectorService } from "./AdminTaskImportReferentielSelector.service";

jest.mock("@sentry/nestjs", () => ({ SentryExceptionCaptured: () => () => undefined }));

// Les écritures phase 1 sont supprimées : une tâche de ce type restée en file doit être marquée
// en échec avec un message explicite, sans lever d'exception hors du worker.
describe("AdminTaskConsumer - tâches phase 1 supprimées", () => {
    const buildConsumer = (task: any = { id: "task-id", metadata: {} }) => {
        const adminTaskRepository = {
            toInProgress: jest.fn().mockResolvedValue(task),
            toFailed: jest.fn(),
            toSuccess: jest.fn(),
        };
        const inscriptionSelector = { handleInscription: jest.fn() };
        const engagementSelector = { handleEngagement: jest.fn() };
        const referentielSelector = new AdminTaskImportReferentielSelectorService(
            ...(Array(6).fill({}) as ConstructorParameters<typeof AdminTaskImportReferentielSelectorService>),
        );
        const cls = { run: (fn: () => any) => fn(), set: jest.fn() };
        const consumer = new AdminTaskConsumer(
            { log: jest.fn(), error: jest.fn() } as unknown as Logger,
            adminTaskRepository as any,
            inscriptionSelector as any,
            engagementSelector as any,
            referentielSelector,
            cls as any,
        );
        return { consumer, adminTaskRepository, inscriptionSelector };
    };

    it.each(ADMIN_TASKS_SUPPRIMEES)("la tâche %s échoue proprement", async (name) => {
        const { consumer, adminTaskRepository, inscriptionSelector } = buildConsumer();

        const result = await consumer.process({ name, data: { id: "task-id" } } as any);

        expect(result).toBe(ConsumerResponse.FAILURE);
        expect(adminTaskRepository.toFailed).toHaveBeenCalledWith(
            "task-id",
            `Task "${name}" supprimée (écritures phase 1 retirées)`,
            undefined,
        );
        expect(adminTaskRepository.toSuccess).not.toHaveBeenCalled();
        expect(inscriptionSelector.handleInscription).not.toHaveBeenCalled();
    });

    it.each([
        ReferentielTaskType.IMPORT_ROUTES,
        ReferentielTaskType.IMPORT_CLASSES,
        ReferentielTaskType.IMPORT_DESISTER_CLASSES,
        ReferentielTaskType.IMPORT_DESISTER_CLASSES_ET_IMPORTER_CLASSES,
    ])("un import référentiel %s en file échoue proprement", async (type) => {
        const { consumer, adminTaskRepository } = buildConsumer({ id: "task-id", metadata: { parameters: { type } } });

        const result = await consumer.process({ name: TaskName.REFERENTIEL_IMPORT, data: { id: "task-id" } } as any);

        expect(result).toBe(ConsumerResponse.FAILURE);
        expect(adminTaskRepository.toFailed).toHaveBeenCalledWith(
            "task-id",
            `Import "${type}" supprimé (écritures phase 1 retirées)`,
            undefined,
        );
    });

    it("l'export des jeunes reste traité", async () => {
        const { consumer, adminTaskRepository, inscriptionSelector } = buildConsumer();
        inscriptionSelector.handleInscription.mockResolvedValue({ rapportKey: "key" });

        const result = await consumer.process({ name: TaskName.JEUNE_EXPORT, data: { id: "task-id" } } as any);

        expect(result).toBe(ConsumerResponse.SUCCESS);
        expect(adminTaskRepository.toSuccess).toHaveBeenCalledWith("task-id", { rapportKey: "key" });
    });
});
