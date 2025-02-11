export interface PlanMarketingGateway {
    importerContacts(nomListe: string, contacts: any, folderId: number, notifyUrl: string): Promise<number>;
    updateCampagne(nomListe: string, campagneId: string): Promise<void>;
    // TODO : add type when model of campagne is available
    findCampagneById(campagneId: string): Promise<any>;
}

export const PlanMarketingGateway = Symbol("PlanMarketingGateway");
