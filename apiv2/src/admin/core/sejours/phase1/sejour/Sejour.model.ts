export type SejourModel = {
    id: string;
    nom?: string;
    placesRestantes?: number;
    placesTotal?: number;
    chefDeCentreReferentId?: string;
    chefDeCentreReferentNom?: string;
    region?: string;
    departement?: string;
    centreId?: string;
    centreCode?: string;
    centreNom?: string;
    centreVille?: string;
    centreCodePostal?: string;
    sessionName?: string;
    sessionId?: string;
    equipe: {
        firstName?: string;
        lastName?: string;
        role?: string;
        email?: string;
        phone?: string;
    }[];
    sejourSnuId?: string;
    dateStart?: string;
    dateEnd?: string;
    sanitaryContactEmail?: string;
    // mandatory
    listeAttente: string[];
    status: string;
    projetPedagogiqueFiles: SejourFile[];
    emploiDuTempsFiles: SejourFile[];
    hasTimeSchedule: string;
    hasPedagoProject: string;
};

interface SejourFile {
    _id?: string;
    name?: string;
    uploadedAt?: string;
    size?: number;
    mimetype?: string;
}
