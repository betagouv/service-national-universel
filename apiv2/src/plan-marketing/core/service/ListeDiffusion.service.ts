import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { ListeDiffusionModel, CreateListeDiffusionModel } from "@plan-marketing/core/ListeDiffusion.model";
import { ListeDiffusionGateway } from "../gateway/ListeDiffusion.gateway";

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
            throw new NotFoundException("Liste de diffusion non trouvée");
        }
        return listeDiffusion;
    }

    async updateListeDiffusion(id: string, listeDiffusionDto: Partial<ListeDiffusionModel>) {
        const existingListeDiffusion = await this.getListeDiffusionById(id);

        const updatedListeDiffusion = await this.listeDiffusionGateway.update({
            ...existingListeDiffusion,
            ...listeDiffusionDto,
            id,
        });

        if (!updatedListeDiffusion) {
            throw new Error("Liste de diffusion n'a pas été mise à jour");
        }
        return updatedListeDiffusion;
    }

    async deleteListeDiffusion(id: string) {
        await this.getListeDiffusionById(id);
        await this.listeDiffusionGateway.delete(id);
    }

    async searchListesDiffusion(filter?: Record<string, any>, sort?: "ASC" | "DESC"): Promise<ListeDiffusionModel[]> {
        return this.listeDiffusionGateway.search(filter, sort);
    }
}
