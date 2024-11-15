import { PointDeRassemblementModel } from "./PointDeRassemblement.model";

export interface PointDeRassemblementGateway {
    findById(id: string): Promise<PointDeRassemblementModel>;
    findBySessionId(sessionId: string): Promise<PointDeRassemblementModel[]>;
}

export const PointDeRassemblementGateway = Symbol("PointDeRassemblementGateway");
