import { Inject, Injectable, Logger } from "@nestjs/common";

import { TaskName, TaskStatus, CLASSE_IMPORT_EN_MASSE_COLUMNS, YOUNG_STATUS } from "snu-lib";

import { TaskGateway } from "@task/core/Task.gateway";

import { ClasseGateway } from "./Classe.gateway";
import { ClasseModel } from "./Classe.model";
import { FunctionalException, FunctionalExceptionCode } from "@shared/core/FunctionalException";
import { JeuneGateway } from "../../jeune/Jeune.gateway";

export type StatusImportInscriptionEnMasse = {
    status: TaskStatus | "NONE";
    statusDate?: Date;
    lastCompletedAt?: Date;
};

@Injectable()
export class ClasseService {
    private readonly logger = new Logger(ClasseService.name);
    constructor(
        @Inject(ClasseGateway) private readonly classeGateway: ClasseGateway,
        @Inject(TaskGateway) private readonly taskGateway: TaskGateway,
        @Inject(JeuneGateway) private readonly jeuneGateway: JeuneGateway,
    ) {}

    async getStatusImportInscriptionEnMasse(classeId: string): Promise<StatusImportInscriptionEnMasse> {
        const lastImport = (
            await this.taskGateway.findByNames(
                [TaskName.IMPORT_CLASSE_EN_MASSE],
                {
                    "metadata.parameters.classeId": classeId,
                },
                "DESC",
                1,
            )
        )?.[0];

        const lastImportCompleted = (
            await this.taskGateway.findByNames(
                [TaskName.IMPORT_CLASSE_EN_MASSE],
                {
                    status: TaskStatus.COMPLETED,
                    "metadata.parameters.classeId": classeId,
                },
                "DESC",
                1,
            )
        )?.[0];
        return {
            status: lastImport?.status || "NONE",
            statusDate: lastImport?.updatedAt,
            lastCompletedAt: lastImportCompleted?.updatedAt,
        };
    }

    async findById(id: string): Promise<ClasseModel> {
        const classe = await this.classeGateway.findById(id);
        if (!classe) {
            throw new FunctionalException(FunctionalExceptionCode.NOT_FOUND);
        }
        return classe;
    }

    checkImportMapping(mapping: Record<CLASSE_IMPORT_EN_MASSE_COLUMNS, string>): void {
        Object.keys(mapping).forEach((key) => {
            if (!Object.values(CLASSE_IMPORT_EN_MASSE_COLUMNS).includes(key as CLASSE_IMPORT_EN_MASSE_COLUMNS)) {
                throw new FunctionalException(FunctionalExceptionCode.NOT_ENOUGH_DATA, key);
            }
        });
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
