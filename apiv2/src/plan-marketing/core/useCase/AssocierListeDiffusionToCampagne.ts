import { Injectable } from "@nestjs/common";
import { UseCase } from "@shared/core/UseCase";

Injectable();
export class AssocierListeDiffusionToCampagne implements UseCase<void> {
    constructor() {}
    async execute(listeId: string): Promise<void> {
        // Gateway update campagne
    }
}
