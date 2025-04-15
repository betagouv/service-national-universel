import { Injectable } from "@nestjs/common";
import { UseCase } from "@shared/core/UseCase";
import { PreparerEnvoiCampagne } from "../PreparerEnvoiCampagne";
@Injectable()
export class EnvoyerCampagneProgrammee implements UseCase<void> {
    constructor(private readonly preparerEnvoiCampagne: PreparerEnvoiCampagne) {}
    async execute(): Promise<void> {
        // Lister toutes les programmations de campagnes
        // Pour chaque campagne programmée, vérifier si la date d'envoi est passée
        // TODO: Récupérer les campagnes programmées
        const campagnesProgrammeesIds: string[] = [];
        for (const campagneProgrammeeId of campagnesProgrammeesIds) {
            await this.preparerEnvoiCampagne.execute(campagneProgrammeeId);
        }
    }
}
