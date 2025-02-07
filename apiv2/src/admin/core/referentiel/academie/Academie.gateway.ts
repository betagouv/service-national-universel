import { AcademieModel, CreateAcademieModel } from "./Academie.model";

export interface AcademieGateway {
    findByCode(code: string): Promise<AcademieModel | undefined>;
    create(academie: CreateAcademieModel): Promise<AcademieModel>;
    update(academie: AcademieModel): Promise<AcademieModel>;
    deleteAll(): Promise<void>;
}

export const AcademieGateway = Symbol("AcademieGateway");
