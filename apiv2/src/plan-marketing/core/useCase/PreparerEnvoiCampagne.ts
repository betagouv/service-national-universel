import { Inject, Injectable } from "@nestjs/common";
import { UseCase } from "@shared/core/UseCase";
import { CampagneSpecifiqueModelWithRefAndGeneric, CampagneSpecifiqueModelWithoutRef } from "../Campagne.model";
import { ImporterContacts } from "./ImporterContacts";
import { FunctionalException, FunctionalExceptionCode } from "@shared/core/FunctionalException";
import { isCampagneGenerique } from "snu-lib";
import { CampagneGateway } from "../gateway/Campagne.gateway";
import { CreerListeDiffusion } from "./CreerListeDiffusion";
import { PlanMarketingCampagne, PlanMarketingGateway } from "../gateway/PlanMarketing.gateway";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class PreparerEnvoiCampagne implements UseCase<void> {
    constructor(
        @Inject(CampagneGateway) private readonly campagneGateway: CampagneGateway,
        private readonly creerListeDiffusion: CreerListeDiffusion,
        @Inject(PlanMarketingGateway) private readonly planMarketingGateway: PlanMarketingGateway,
        private readonly importerContacts: ImporterContacts,
        private readonly configService: ConfigService,
    ) {}
    async execute(campagneId: string, programmationId?: string): Promise<void> {
        const campagne = (await this.campagneGateway.findById(campagneId)) as CampagneSpecifiqueModelWithRefAndGeneric;
        if (!campagne) {
            throw new FunctionalException(FunctionalExceptionCode.CAMPAIGN_NOT_FOUND);
        }
        if (isCampagneGenerique(campagne)) {
            throw new FunctionalException(FunctionalExceptionCode.CAMPAIGN_SHOULD_NOT_BE_GENERIC);
        }

        await this.planMarketingGateway.deleteOldestListeDiffusion();

        const campagneFournisseurToCreate: PlanMarketingCampagne = {
            name: campagne.nom,
            sender: {
                email: this.configService.getOrThrow("email.sender.noreply.email"),
                name: this.configService.getOrThrow("email.sender.noreply.name"),
            },
            templateId: campagne.templateId,
            subject: campagne.objet,
        };
        const campagneFournisseur = await this.planMarketingGateway.createCampagne(campagneFournisseurToCreate);
        if (!campagneFournisseur) {
            throw new FunctionalException(FunctionalExceptionCode.CAMPAIGN_NOT_FOUND);
        }
        // Créer la liste de diffusion et importer les contacts sur le fournisseur
        const contacts = await this.creerListeDiffusion.execute(campagneId);
        await this.importerContacts.execute(campagneId, campagneFournisseur.id!, contacts, programmationId);
    }
}
