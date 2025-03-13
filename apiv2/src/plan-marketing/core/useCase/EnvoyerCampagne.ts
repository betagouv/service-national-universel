import { Injectable } from "@nestjs/common";
import { UseCase } from "@shared/core/UseCase";
import { CampagneModel } from "../Campagne.model";
Injectable();
export class EnvoyerCampagne implements UseCase<void> {
    constructor() {}
    async execute(campagneId: string): Promise<void> {
        // Créer la campagne sur Brevo
        //
        // Créer la liste de diffusion et upload sur bucket
        //
        // Appel de ImporterEtCreerListeDiffusion
        // => Créer la liste de diffusion sur Brevo
        // => Rattacher la campagne à la liste de diffusion sur Brevo
    }
}
