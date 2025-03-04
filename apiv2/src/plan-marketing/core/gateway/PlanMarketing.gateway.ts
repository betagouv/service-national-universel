export interface PlanMarketingGateway {
    importerContacts(nomListe: string, contacts: any, folderId: number, notifyUrl: string): Promise<number>;
    updateCampagne(nomListe: string, campagneId: string): Promise<void>;
    // TODO : add type when model of campagne is available
    findCampagneById(campagneId: string): Promise<any>;
    findTemplateById(templateId: number): Promise<string | undefined>;
    deleteOldestListeDiffusion(): Promise<void>;
}

export const PlanMarketingGateway = Symbol("PlanMarketingGateway");
