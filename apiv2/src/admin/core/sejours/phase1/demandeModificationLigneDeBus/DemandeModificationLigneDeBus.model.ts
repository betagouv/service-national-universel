// TODO: Mettre à niveau pour de l'ecriture
export type DemandeModificationLigneDeBusModel = {
    id: string;
    sessionNom: string;
    sessionId?: string;
    ligneDeBusId: string;
    numeroLigne: string;
    messageDemande: string;
    idUtilisateurDemande: string;
    nomUtilisateurDemande: string;
    roleUtilisateurDemande: string;
    idsTags: string[];
    statut: string;
    idUtilisateurStatut: string;
    nomUtilisateurStatut: string;
    dateStatut: Date;
    avis?: string;
    idUtilisateurAvis: string;
    nomUtilisateurAvis: string;
    dateAvis: Date;
    // TODO: add messages
};
