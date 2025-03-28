export interface PlanMarketingCampagne {
    id?: number;
    name: string;
    sender: { name?: string; email: string };
    templateId: number;
    subject: string;
    recipients?: { listIds: number[] };
}

export interface PlanMarketingGateway {
    importerContacts(nomListe: string, contacts: string, folderId: number, notifyUrl: string): Promise<number>;
    updateCampagne(nomListe: string, campagneId: string): Promise<void>;
    // TODO : add type when model of campagne is available
    findCampagneById(campagneId: string): Promise<any>;
    findTemplateById(templateId: number): Promise<string | undefined>;
    deleteOldestListeDiffusion(): Promise<void>;
    createCampagne(campagne: PlanMarketingCampagne): Promise<Pick<PlanMarketingCampagne, "id">>;
    sendCampagneNow(campagneId: string): Promise<void>;
}

export const PlanMarketingGateway = Symbol("PlanMarketingGateway");
