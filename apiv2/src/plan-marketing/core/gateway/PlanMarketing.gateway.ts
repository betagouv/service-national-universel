export interface PlanMarketingGateway {
    importerContacts(nomListe: string, contacts: any): Promise<number>;
    updateCampagne(nomListe: string, campagneId: string): Promise<void>;
}

export const PlanMarketingGateway = Symbol("PlanMarketingGateway");
