import { Inject, Injectable, Logger } from "@nestjs/common";

import { YOUNG_STATUS } from "snu-lib";

import { ClasseGateway } from "./Classe.gateway";
import { ClasseModel } from "./Classe.model";
import { FunctionalException, FunctionalExceptionCode } from "@shared/core/FunctionalException";
import { JeuneGateway } from "../../jeune/Jeune.gateway";

@Injectable()
export class ClasseService {
    private readonly logger = new Logger(ClasseService.name);
    constructor(
        @Inject(ClasseGateway) private readonly classeGateway: ClasseGateway,
        @Inject(JeuneGateway) private readonly jeuneGateway: JeuneGateway,
    ) {}

    async findById(id: string): Promise<ClasseModel> {
        const classe = await this.classeGateway.findById(id);
        if (!classe) {
            throw new FunctionalException(FunctionalExceptionCode.NOT_FOUND);
        }
        return classe;
    }

    async updatePlacesPrises(classeId?: string): Promise<void> {
        if (!classeId) {
            throw new FunctionalException(FunctionalExceptionCode.NOT_FOUND);
        }
        const jeunes = await this.jeuneGateway.findByClasseId(classeId);
        const jeunesInscrits = jeunes.filter((jeune) => jeune.statut === YOUNG_STATUS.VALIDATED);
        const placesPrises = jeunesInscrits.length;
        this.logger.debug(`Updating places prises for classe ${classeId} to ${placesPrises}`);
        await this.classeGateway.updatePlacesPrises(classeId, placesPrises);
    }
}
