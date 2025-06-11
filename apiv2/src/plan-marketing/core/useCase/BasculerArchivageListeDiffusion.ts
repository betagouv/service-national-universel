import { Inject, Injectable } from "@nestjs/common";
import { UseCase } from "@shared/core/UseCase";
import { FunctionalException, FunctionalExceptionCode } from "@shared/core/FunctionalException";
import { ListeDiffusionModel } from "../ListeDiffusion.model";
import { ListeDiffusionGateway } from "../gateway/ListeDiffusion.gateway";

@Injectable()
export class BasculerArchivageListeDiffusion implements UseCase<ListeDiffusionModel | null> {
    constructor(@Inject(ListeDiffusionGateway) private readonly listeDiffusionGateway: ListeDiffusionGateway) {}

    async execute(id: string): Promise<ListeDiffusionModel | null> {
        const liste = await this.listeDiffusionGateway.findById(id);
        if (!liste) {
            throw new FunctionalException(FunctionalExceptionCode.LISTE_DIFFUSION_NOT_FOUND);
        }

        const updated = await this.listeDiffusionGateway.update({
            ...liste,
            isArchived: !liste.isArchived,
        });
        return updated;
    }
}