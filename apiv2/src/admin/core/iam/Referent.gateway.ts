import { ROLES, SUB_ROLES } from "snu-lib";
import { ReferentModel, ReferentPasswordModel } from "./Referent.model";

//TODO : move to snu-lib
export type Role = (typeof ROLES)[keyof typeof ROLES];
export type SousRole = (typeof SUB_ROLES)[keyof typeof SUB_ROLES];

export interface ReferentGateway {
    findAll(): Promise<ReferentModel[]>;
    findById(id: string): Promise<ReferentModel>;
    findByEmail(email: string): Promise<ReferentPasswordModel>;
    update(referent: ReferentModel): Promise<ReferentModel>;
    create(referent: ReferentModel): Promise<ReferentModel>;
    findByIds(ids: string[]): Promise<ReferentModel[]>;
    findByDepartementRoleAndSousRole(departement: string, role: Role, sousRole?: SousRole): Promise<ReferentModel[]>;
    generateInvitationTokenById(id: string): Promise<ReferentModel>;
}

export const ReferentGateway = Symbol("ReferentGateway");
