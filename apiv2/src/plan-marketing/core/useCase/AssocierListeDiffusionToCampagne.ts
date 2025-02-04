import { Injectable } from "@nestjs/common";
import { UseCase } from "@shared/core/UseCase";

Injectable();
export class AssocierListeDiffusionToCampagne implements UseCase<void> {
    constructor() {}
    async execute(nomListe?: string, campagneId?: string): Promise<void> {
        // Récupérer la liste de diffusion à partir du nom
        //
        // Ajouter listeId à la campagne
        //
        // Mettre à jour la tache
    }
}
