import { DemandeModificationLigneDeBusModel } from "./DemandeModificationLigneDeBus.model";

export interface DemandeModificationLigneDeBusGateway {
    findByLigneDeBusIds(ligneDeBusIds: string[]): Promise<DemandeModificationLigneDeBusModel[]>;
    findBySessionNom(sessionNom: string): Promise<DemandeModificationLigneDeBusModel[]>;
    delete(demandeModificationLigneDeBus: DemandeModificationLigneDeBusModel): Promise<void>;
}

export const DemandeModificationLigneDeBusGateway = Symbol("DemandeModificationLigneDeBusGateway");
