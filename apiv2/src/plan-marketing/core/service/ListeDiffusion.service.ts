import { Inject, Injectable } from "@nestjs/common";
import { ListeDiffusionModel, CreateListeDiffusionModel, UpdateListeDiffusionModel } from "@plan-marketing/core/ListeDiffusion.model";
import { ListeDiffusionGateway } from "../gateway/ListeDiffusion.gateway";
import { FunctionalException, FunctionalExceptionCode } from "@shared/core/FunctionalException";

@Injectable()
export class ListeDiffusionService {
    constructor(
        @Inject(ListeDiffusionGateway) private readonly listeDiffusionGateway: ListeDiffusionGateway,
    ) {}

    async creerListeDiffusion(listeDiffusion: CreateListeDiffusionModel) {
        return this.listeDiffusionGateway.save(listeDiffusion);
    }

    async getListeDiffusionById(id: string) {
        const listeDiffusion = await this.listeDiffusionGateway.findById(id);
        if (!listeDiffusion) {
            throw new FunctionalException(FunctionalExceptionCode.LISTE_DIFFUSION_NOT_FOUND)
        }
        return listeDiffusion;
    }

    async updateListeDiffusion(id: string, listeDiffusion: UpdateListeDiffusionModel) {
        const existingListeDiffusion = await this.getListeDiffusionById(id);

        const updatedListeDiffusion = await this.listeDiffusionGateway.update({
            ...existingListeDiffusion,
            ...listeDiffusion,
            type: existingListeDiffusion.type,
            id,
        });

        if (!updatedListeDiffusion) {
            throw new Error("Liste de diffusion n'a pas été mise à jour");
        }
        return updatedListeDiffusion;
    }

    async deleteListeDiffusion(id: string) {
        try {
            await this.listeDiffusionGateway.delete(id);
        } catch (error) {
            throw new FunctionalException(FunctionalExceptionCode.LISTE_DIFFUSION_NOT_FOUND);
        }
    }

    async searchListesDiffusion(filter?: Record<string, any>, sort?: "ASC" | "DESC"): Promise<ListeDiffusionModel[]> {
        return this.listeDiffusionGateway.search(filter, sort);
    }
}
