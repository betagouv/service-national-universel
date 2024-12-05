import { ReferentModel } from "@admin/core/iam/Referent.model";
import { ReferentSyncDto } from "@notification/infra/email/Contact";

export interface ContactGateway {
    syncReferent(referent: ReferentSyncDto): Promise<void>;
    syncReferents(referents: ReferentSyncDto[]): Promise<void>;
    syncJeunes(referents: ReferentModel[]): Promise<void>;
}

export const ContactGateway = Symbol("ContactGateway");
