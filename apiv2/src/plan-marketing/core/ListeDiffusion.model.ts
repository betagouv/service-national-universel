import { ListeDiffusionEnum, ListeDiffusionFiltres } from "snu-lib";

export interface ListeDiffusionModel {
    id: string;
    nom: string;
    type: ListeDiffusionEnum;
    filters: ListeDiffusionFiltres;
    createdAt?: Date;
    updatedAt?: Date;
}

export type CreateListeDiffusionModel = Omit<ListeDiffusionModel, "id" | "createdAt" | "updatedAt">;
