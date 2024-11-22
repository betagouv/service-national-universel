import { ReferentModel } from "@admin/core/iam/Referent.model";

export interface ContactGateway {
    syncReferent(referent: ReferentModel): Promise<void>;
    syncReferents(referents: ReferentModel[]): Promise<void>;
    syncJeunes(referents: ReferentModel[]): Promise<void>;
}

export const ContactGateway = Symbol("ContactGateway");
