import { AcademieModel, CreateAcademieModel } from "./Academie.model";

export interface AcademieGateway {
    findByCode(code: string): Promise<AcademieModel | undefined>;
    create(academie: CreateAcademieModel): Promise<AcademieModel>;
    update(academie: AcademieModel): Promise<AcademieModel>;
}

export const AcademieGateway = Symbol("AcademieGateway");
