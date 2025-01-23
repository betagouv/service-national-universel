// TODO: Mettre à niveau pour de l'ecriture
export type SegmentDeLigneModel = {
    id: string;
    ligneDeBusId: string;
    pointDeRassemblementId: string;
    heureArriveeBus?: string;
    heureRencontre: string;
    heureDepart: string;
    heureRetour: string;
    typeTransport: string;
    // TODO: add stepPoints
};
