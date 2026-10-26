import { Inject, Injectable } from "@nestjs/common";
import { isAdmin } from "snu-lib";

import { TaskGateway } from "@task/core/Task.gateway";
import { TechnicalException, TechnicalExceptionType } from "./TechnicalException";

/**
 * Emplacements où une clé de fichier est déposée par les tâches d'administration :
 * `results.rapportKey` pour les rapports et exports produits, `parameters.fileKey` pour les
 * fichiers déposés en entrée d'un import.
 */
const CHAMPS_CLE = ["metadata.results.rapportKey", "metadata.parameters.fileKey"] as const;

/**
 * Autorisation de lecture d'un objet du bucket applicatif (H79).
 *
 * La permission EXPORT:READ est accordée sans policy (migration 20250723094011) : elle ne dit
 * rien du périmètre. Tant que la clé S3 était utilisée brute, un responsable de structure ou un
 * administrateur CLE téléchargeait les rapports d'affectation, d'inscription en masse et les
 * exports d'autres territoires — les clés fondées sur un identifiant visible et un horodatage
 * à la seconde étant énumérables.
 *
 * La clé doit donc être rattachée à une tâche, et l'appelant en être l'auteur. Les
 * administrateurs nationaux consultent les rapports des tâches d'administration (écran
 * Paramètres > Opérations), qui n'ont pas d'auteur nominatif.
 */
@Injectable()
export class FileAccessService {
    constructor(@Inject(TaskGateway) private readonly taskGateway: TaskGateway) {}

    async verifierAcces(
        key: string,
        user: { id?: string; role?: string; sousRole?: string } | undefined,
    ): Promise<void> {
        if (!key) {
            throw new TechnicalException(TechnicalExceptionType.FORBIDDEN, "clé de fichier absente");
        }

        const taches = (
            await Promise.all(
                CHAMPS_CLE.map((champ) =>
                    this.taskGateway.findByMetadata<{ auteur?: { id?: string } }, unknown>({ [champ]: key }),
                ),
            )
        ).flat();

        if (!taches.length) {
            throw new TechnicalException(TechnicalExceptionType.FORBIDDEN, "fichier non rattaché à une tâche");
        }

        if (isAdmin({ role: user?.role })) {
            return;
        }

        const estAuteur = taches.some((tache) => tache.metadata?.parameters?.auteur?.id === user?.id);
        if (!estAuteur) {
            throw new TechnicalException(TechnicalExceptionType.FORBIDDEN, "fichier hors du périmètre de l'appelant");
        }
    }
}
