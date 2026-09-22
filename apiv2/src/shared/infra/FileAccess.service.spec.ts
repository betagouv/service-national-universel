/**
 * Rattachement d'une clé S3 à une ressource autorisée (H79).
 *
 * `GET /v2/file?key=` et `GET /v2/file/signed-url?key=` n'exigeaient que la permission
 * EXPORT:READ — accordée sans policy aux responsables, superviseurs, administrateurs CLE et
 * référents territoriaux. La clé était ensuite utilisée brute : n'importe quel objet du bucket
 * applicatif (rapports d'affectation, inscriptions en masse, exports d'autres périmètres)
 * était téléchargeable, les clés étant énumérables (sessionId/classeId + horodatage à la seconde).
 *
 * Une clé n'est désormais servie que si une tâche la référence, et, hors administrateur
 * national, si l'appelant est l'auteur de cette tâche.
 */
import { Test, TestingModule } from "@nestjs/testing";
import { ROLES, SUB_ROLE_GOD } from "snu-lib";

import { TaskGateway } from "@task/core/Task.gateway";
import { TechnicalException } from "@shared/infra/TechnicalException";

import { FileAccessService } from "./FileAccess.service";

const CLE_RAPPORT = "file/admin/sejours/phase1/affectation/6600000000000000000000ff/affectation-hts/rapport.xlsx";

describe("FileAccessService", () => {
    let service: FileAccessService;
    const taskGateway = { findByMetadata: jest.fn() };

    beforeEach(async () => {
        jest.clearAllMocks();
        const module: TestingModule = await Test.createTestingModule({
            providers: [FileAccessService, { provide: TaskGateway, useValue: taskGateway }],
        }).compile();
        service = module.get(FileAccessService);
    });

    const aucuneTache = () => taskGateway.findByMetadata.mockResolvedValue([]);
    const tacheDe = (auteurId?: string) =>
        taskGateway.findByMetadata.mockImplementation(async (critere: Record<string, string>) =>
            Object.values(critere)[0] === CLE_RAPPORT
                ? [{ id: "tache-1", metadata: { parameters: { auteur: { id: auteurId } } } }]
                : [],
        );

    const responsable = { id: "responsable-1", role: ROLES.RESPONSIBLE };

    it("refuse une clé qu'aucune tâche ne référence", async () => {
        aucuneTache();

        await expect(service.verifierAcces("file/appelAProjet/invitations.csv", responsable)).rejects.toThrow(
            TechnicalException,
        );
    });

    it("refuse le rapport d'une tâche demandée par quelqu'un d'autre", async () => {
        tacheDe("un-autre-referent");

        await expect(service.verifierAcces(CLE_RAPPORT, responsable)).rejects.toThrow(TechnicalException);
    });

    it("autorise l'auteur de la tâche à récupérer son rapport", async () => {
        tacheDe(responsable.id);

        await expect(service.verifierAcces(CLE_RAPPORT, responsable)).resolves.toBeUndefined();
    });

    it("autorise un administrateur national sur le rapport d'une tâche d'administration", async () => {
        tacheDe(undefined);

        await expect(
            service.verifierAcces(CLE_RAPPORT, { id: "admin-1", role: ROLES.ADMIN }),
        ).resolves.toBeUndefined();
        await expect(
            service.verifierAcces(CLE_RAPPORT, { id: "god-1", role: ROLES.ADMIN, sousRole: SUB_ROLE_GOD }),
        ).resolves.toBeUndefined();
    });

    it("refuse même à un administrateur une clé qu'aucune tâche ne référence", async () => {
        aucuneTache();

        await expect(
            service.verifierAcces("file/si-snu/secret.json", { id: "admin-1", role: ROLES.ADMIN }),
        ).rejects.toThrow(TechnicalException);
    });

    it("refuse une clé vide", async () => {
        await expect(service.verifierAcces("", responsable)).rejects.toThrow(TechnicalException);
        expect(taskGateway.findByMetadata).not.toHaveBeenCalled();
    });

    it("reconnaît une clé déposée en paramètre d'une tâche d'import", async () => {
        taskGateway.findByMetadata.mockImplementation(async (critere: Record<string, string>) =>
            "metadata.parameters.fileKey" in critere
                ? [{ id: "tache-2", metadata: { parameters: { auteur: { id: responsable.id } } } }]
                : [],
        );

        await expect(service.verifierAcces(CLE_RAPPORT, responsable)).resolves.toBeUndefined();
    });
});
