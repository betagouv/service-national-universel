import { STATUS_CLASSE } from "snu-lib";
import { ClasseModel, CreateClasseModel } from "./Classe.model";

export interface ClasseGateway {
    findAll(): Promise<ClasseModel[]>;
    findById(id: string): Promise<ClasseModel>;
    update(classe: ClasseModel): Promise<ClasseModel>;
    create(classe: CreateClasseModel): Promise<ClasseModel>;
    findByReferentId(referentId: string): Promise<ClasseModel[]>;
    findReferentIdsByClasseIds(classeIds: string[]): Promise<string[]>;
    updateStatut(classeId: string, statut: keyof typeof STATUS_CLASSE): Promise<ClasseModel>;
    findByLigneDeBusIds(ids: string[]): Promise<ClasseModel[]>;
    findBySessionIdAndDepartmentNotWithdrawn(sessionId: string, departements: string[]): Promise<ClasseModel[]>;
    findByIds(ids: string[]): Promise<ClasseModel[]>;
    updatePlacesPrises(classeId: string, placesPrises: number): Promise<ClasseModel>;
}

export const ClasseGateway = Symbol("ClasseGateway");
