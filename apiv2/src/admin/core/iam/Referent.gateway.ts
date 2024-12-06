import { Role, SousRole } from "@shared/core/Role";
import { CreateReferentModel, ReferentModel, ReferentPasswordModel } from "./Referent.model";

export interface ReferentGateway {
    findAll(): Promise<ReferentModel[]>;
    findById(id: string): Promise<ReferentModel>;
    findByEmail(email: string): Promise<ReferentModel>;
    findReferentPasswordByEmail(email: string): Promise<ReferentPasswordModel>;
    update(referent: ReferentModel): Promise<ReferentModel>;
    create(referent: CreateReferentModel): Promise<ReferentModel>;
    findByIds(ids: string[]): Promise<ReferentModel[]>;
    findByDepartementRoleAndSousRole(departement: string, role: Role, sousRole?: SousRole): Promise<ReferentModel[]>;
    generateInvitationTokenById(id: string): Promise<ReferentModel>;
    delete(id: string): Promise<void>;
}

export const ReferentGateway = Symbol("ReferentGateway");
