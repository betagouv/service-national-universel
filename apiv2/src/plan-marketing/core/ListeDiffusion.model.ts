import { ListeDiffusionEnum } from "snu-lib";

export interface ListeDiffusionModel {
    id: string;
    nom: string;
    type: ListeDiffusionEnum;
    createdAt?: Date;
    updatedAt?: Date;
}

export type CreateListeDiffusionModel = Omit<ListeDiffusionModel, "id" | "createdAt" | "updatedAt">;
