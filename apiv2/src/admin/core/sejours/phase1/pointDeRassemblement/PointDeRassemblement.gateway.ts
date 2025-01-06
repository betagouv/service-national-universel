import { PointDeRassemblementModel } from "./PointDeRassemblement.model";

export interface PointDeRassemblementGateway {
    findById(id: string): Promise<PointDeRassemblementModel>;
    findByIds(ids: string[]): Promise<PointDeRassemblementModel[]>;
    findByMatricule(matricule: string): Promise<PointDeRassemblementModel>;
    findByMatricules(matricules: string[]): Promise<PointDeRassemblementModel[]>;
    findBySessionId(sessionId: string): Promise<PointDeRassemblementModel[]>;
}

export const PointDeRassemblementGateway = Symbol("PointDeRassemblementGateway");
