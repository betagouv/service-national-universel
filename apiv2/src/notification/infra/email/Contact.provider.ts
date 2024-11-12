import { ConsumerResponse } from "@shared/infra/ConsumerResponse";

export interface ContactProvider {
    syncJeune(jeune): Promise<ConsumerResponse>;
    syncReferent(jeune): Promise<ConsumerResponse>;
}

export const ContactProvider = Symbol("ContactProvider");
