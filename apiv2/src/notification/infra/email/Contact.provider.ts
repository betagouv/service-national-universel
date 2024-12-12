import { ConsumerResponse } from "@shared/infra/ConsumerResponse";
import { ReferentSyncDto } from "./Contact";
export interface ContactProviderError {
    email: string;
    code: string;
    message: string;
}
export interface ContactProvider {
    syncJeune(jeune): Promise<ConsumerResponse>;
    syncReferent(referent: ReferentSyncDto): Promise<ConsumerResponse>;
}

export const ContactProvider = Symbol("ContactProvider");
