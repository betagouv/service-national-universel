/**
 * M75 : `/inscription-en-masse/importer` n'accepte qu'un fichier validé pour la classe,
 * et une seule fois.
 */
import { TaskName } from "snu-lib";

import { FunctionalException } from "@shared/core/FunctionalException";

import { ClasseImportService } from "./ClasseImportEnMasse.service";
import { getInscriptionEnMasseFileKeyPrefix } from "./ClasseImportEnMasse.model";

describe("ClasseImportService.importClasse", () => {
    const auteur = { id: "ref-1" };
    const fileKey = `${getInscriptionEnMasseFileKeyPrefix("classe-1")}inscription_en_masse_classe-1.xlsx`;
    let taskGateway: { create: jest.Mock; findByNames: jest.Mock };
    let service: ClasseImportService;

    beforeEach(() => {
        taskGateway = {
            create: jest.fn().mockImplementation((task) => Promise.resolve({ ...task, id: "task-1" })),
            findByNames: jest.fn().mockResolvedValue([]),
        };
        service = new ClasseImportService(taskGateway as any);
    });

    it("crée la tâche pour un fichier validé de la classe", async () => {
        await service.importClasse("classe-1", null, fileKey, auteur);

        expect(taskGateway.findByNames).toHaveBeenCalledWith(
            [TaskName.IMPORT_CLASSE_EN_MASSE],
            { "metadata.parameters.fileKey": fileKey },
            undefined,
            1,
        );
        expect(taskGateway.create).toHaveBeenCalled();
    });

    it("refuse un fichier validé pour une autre classe", async () => {
        await expect(service.importClasse("classe-2", null, fileKey, auteur)).rejects.toThrow(FunctionalException);
        expect(taskGateway.create).not.toHaveBeenCalled();
    });

    it("refuse une clé arbitraire ou qui remonte l'arborescence", async () => {
        await expect(service.importClasse("classe-1", null, "file/autre/chose.xlsx", auteur)).rejects.toThrow(
            FunctionalException,
        );
        await expect(
            service.importClasse(
                "classe-1",
                null,
                `${getInscriptionEnMasseFileKeyPrefix("classe-1")}../../classe-2/inscription-en-masse/f.xlsx`,
                auteur,
            ),
        ).rejects.toThrow(FunctionalException);
        expect(taskGateway.create).not.toHaveBeenCalled();
    });

    it("refuse de rejouer un fichier déjà importé", async () => {
        taskGateway.findByNames.mockResolvedValueOnce([{ id: "task-0" }]);

        await expect(service.importClasse("classe-1", null, fileKey, auteur)).rejects.toThrow(FunctionalException);
        expect(taskGateway.create).not.toHaveBeenCalled();
    });
});
