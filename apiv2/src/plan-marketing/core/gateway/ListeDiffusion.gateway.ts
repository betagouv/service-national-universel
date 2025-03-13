import { ListeDiffusionModel, CreateListeDiffusionModel } from "../ListeDiffusion.model";

export interface ListeDiffusionGateway {
    save(listeDiffusion: CreateListeDiffusionModel): Promise<ListeDiffusionModel>;
    findById(id: string): Promise<ListeDiffusionModel | null>;
    search(filter?: Record<string, any>, sort?: "ASC" | "DESC"): Promise<ListeDiffusionModel[]>;
    update(listeDiffusion: ListeDiffusionModel): Promise<ListeDiffusionModel | null>;
    delete(id: string): Promise<void>;
}

export const ListeDiffusionGateway = Symbol("ListeDiffusionGateway");
