import { CreateDepartementModel, DepartementModel } from "./Departement.model";

export interface DepartementGateway {
    findByCode(code: string): Promise<DepartementModel | undefined>;
    create(departement: CreateDepartementModel): Promise<DepartementModel>;
    update(departement: DepartementModel): Promise<DepartementModel>;
    deleteAll(): Promise<void>;
}

export const DepartementGateway = Symbol("DepartementGateway");
