import { ListeDiffusionService } from "@plan-marketing/core/service/ListeDiffusion.service";
import { ListeDiffusionGateway } from "@plan-marketing/core/gateway/ListeDiffusion.gateway";
import { ListeDiffusionEnum } from "snu-lib";

/**
 * Revue finale (GOO-90) — régression 3, partie service : `UpdateListeDiffusionDto` accepte
 * maintenant `type`/`isArchived`/`createdAt`/`updatedAt` (sinon le formulaire admin, qui les
 * réémet toujours via react-hook-form, 400ait). Mais les accepter sur le DTO ne doit pas les
 * rendre modifiables : `isArchived` en particulier a un point d'entrée dédié
 * (`toggle-archivage`) et ne doit jamais changer via cette route. Ce test vérifie que le service
 * les force depuis l'enregistrement existant, quel que soit le corps reçu.
 */
describe("ListeDiffusionService.updateListeDiffusion — force des champs non modifiables (GOO-90)", () => {
    it("force type/isArchived/createdAt/updatedAt depuis l'existant, quel que soit le corps reçu", async () => {
        const existante = {
            id: "liste-1",
            nom: "Ancien nom",
            type: ListeDiffusionEnum.VOLONTAIRES,
            filters: {},
            isArchived: false,
            createdAt: new Date("2024-01-01"),
            updatedAt: new Date("2024-01-01"),
        };
        const gateway = {
            findById: jest.fn().mockResolvedValue(existante),
            update: jest.fn().mockImplementation((liste) => Promise.resolve(liste)),
        };
        const service = new ListeDiffusionService(gateway as unknown as ListeDiffusionGateway);

        // Corps envoyé par le front : tente de changer type/isArchived/createdAt/updatedAt (accidentellement ou pas)
        await service.updateListeDiffusion("liste-1", {
            nom: "Nouveau nom",
            filters: {},
            type: ListeDiffusionEnum.INSCRIPTIONS,
            isArchived: true,
            createdAt: new Date("2099-01-01"),
            updatedAt: new Date("2099-01-01"),
        } as any);

        expect(gateway.update).toHaveBeenCalledWith(
            expect.objectContaining({
                nom: "Nouveau nom", // le champ légitime change bien
                type: ListeDiffusionEnum.VOLONTAIRES, // forcé depuis l'existant, pas INSCRIPTIONS
                isArchived: false, // forcé depuis l'existant, pas true — c'est le point de sécurité
                createdAt: existante.createdAt,
                updatedAt: existante.updatedAt,
            }),
        );
    });
});
