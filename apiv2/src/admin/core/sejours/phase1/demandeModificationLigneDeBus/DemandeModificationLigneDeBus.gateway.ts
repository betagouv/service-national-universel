import { DemandeModificationLigneDeBusModel } from "./DemandeModificationLigneDeBus.model";

export interface DemandeModificationLigneDeBusGateway {
    findBySessionNom(sessionNom: string): Promise<DemandeModificationLigneDeBusModel[]>;
    delete(demandeModificationLigneDeBus: DemandeModificationLigneDeBusModel): Promise<void>;
}

export const DemandeModificationLigneDeBusGateway = Symbol("DemandeModificationLigneDeBusGateway");
