import { ReferentModelLight } from "@admin/core/iam/Referent.model";
import { CLE_COLORATION, CLE_FILIERE, CLE_GRADE, STATUS_CLASSE, STATUS_PHASE1_CLASSE, TYPE_CLASSE } from "snu-lib";

export type ClasseModel = {
    id: string;
    nom?: string;
    sessionNom?: string;
    sessionId?: string;
    departement: string;
    region: string;
    statut: keyof typeof STATUS_CLASSE;
    statutPhase1: keyof typeof STATUS_PHASE1_CLASSE;
    etablissementId: string;
    referentClasseIds: string[];
    uniqueKeyAndId: string;
    uniqueKey: string;
    uniqueId?: string;
    anneeScolaire: string;
    academie: string;
    placesTotal: number;
    placesEstimees: number;
    placesPrises: number;
    coloration?: (typeof CLE_COLORATION)[keyof typeof CLE_COLORATION];
    filiere?: (typeof CLE_FILIERE)[keyof typeof CLE_FILIERE];
    niveau?: keyof typeof CLE_GRADE;
    niveaux: (keyof typeof CLE_GRADE)[] | string[];
    centreCohesionId?: string;
    sejourId?: string;
    ligneId?: string;
    pointDeRassemblementId?: string;
    commentaires: string;
    trimestre?: "T1" | "T2" | "T3" | string;
    type?: keyof typeof TYPE_CLASSE;
};

export type CreateClasseModel = Omit<ClasseModel, "id" | "createdAt" | "updatedAt">;

export type ClasseWithReferentsModel = ClasseModel & {
    referents: ReferentModelLight[];
};

export interface AnnulerClasseDesisteeModel {
    classe: ClasseModel;
    rapport: string;
}
