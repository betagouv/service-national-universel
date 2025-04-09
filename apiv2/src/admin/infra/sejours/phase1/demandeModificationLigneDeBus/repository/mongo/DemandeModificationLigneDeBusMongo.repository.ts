import { Inject, Injectable } from "@nestjs/common";
import { FunctionalException, FunctionalExceptionCode } from "@shared/core/FunctionalException";
import { Model } from "mongoose";
import { DemandeModificationLigneDeBusGateway } from "@admin/core/sejours/phase1/demandeModificationLigneDeBus/DemandeModificationLigneDeBus.gateway";
import {
    DEMANDEMODIFICATIONBUS_MONGOOSE_ENTITY,
    DemandeModificationLigneDeBusDocument,
} from "../../provider/DemandeModificationLigneDeBusMongo.provider";
import { DemandeModificationLigneDeBusModel } from "@admin/core/sejours/phase1/demandeModificationLigneDeBus/DemandeModificationLigneDeBus.model";
import { DemandeModificationLigneDeBusMapper } from "../DemandeModificationLigneDeBus.mapper";

@Injectable()
export class DemandeModificationLigneDeBusRepository implements DemandeModificationLigneDeBusGateway {
    constructor(
        @Inject(DEMANDEMODIFICATIONBUS_MONGOOSE_ENTITY)
        private demandeModificationLigneDeBusMongooseEntity: Model<DemandeModificationLigneDeBusDocument>,
    ) {}

    async findByLigneDeBusIds(ligneDeBusIds: string[]): Promise<DemandeModificationLigneDeBusModel[]> {
        const demandeModificationLigneDeBuss = await this.demandeModificationLigneDeBusMongooseEntity.find({
            lineId: { $in: ligneDeBusIds },
        });
        return DemandeModificationLigneDeBusMapper.toModels(demandeModificationLigneDeBuss);
    }

    async findBySessionNom(sessionNom: string): Promise<DemandeModificationLigneDeBusModel[]> {
        const demandeModificationLigneDeBuss = await this.demandeModificationLigneDeBusMongooseEntity.find({
            cohort: sessionNom,
        });
        return DemandeModificationLigneDeBusMapper.toModels(demandeModificationLigneDeBuss);
    }

    async delete(demandeModificationLigneDeBus: DemandeModificationLigneDeBusModel): Promise<void> {
        const retrievedDemandeModificationLigneDeBus = await this.demandeModificationLigneDeBusMongooseEntity.findById(
            demandeModificationLigneDeBus.id,
        );
        if (!retrievedDemandeModificationLigneDeBus) {
            throw new FunctionalException(FunctionalExceptionCode.NOT_FOUND);
        }
        await retrievedDemandeModificationLigneDeBus.deleteOne();
    }
}
