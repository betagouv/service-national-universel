import { CampagneJeuneType, DestinataireListeDiffusion, EnvoiCampagneStatut } from "snu-lib";
import { CampagneProgrammation } from "./Programmation.model";

/**
 * Interface de base pour toutes les campagnes
 * Contient les champs communs à toutes les campagnes
 */
interface CampagneBase {
    id: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface CampagneEnvoi {
    date: Date;
    statut: EnvoiCampagneStatut;
}
/**
 * Interface pour les campagnes avec tous les champs
 * Utilisée pour les campagnes génériques et spécifiques sans référence
 */
interface CampagneComplete extends CampagneBase {
    nom: string;
    objet: string;
    contexte?: string;
    templateId: number;
    listeDiffusionId: string;
    destinataires: DestinataireListeDiffusion[];
    type: CampagneJeuneType;
    envois?: CampagneEnvoi[];
    programmations: CampagneProgrammation[];
}

/**
 * Modèle pour une campagne générique
 * Contient tous les champs de CampagneComplete avec generic: true
 */
export interface CampagneGeneriqueModel extends CampagneComplete {
    generic: true;
}

/**
 * Modèle pour une campagne spécifique sans référence à une campagne générique
 * Contient tous les champs de CampagneComplete + cohortId avec generic: false
 */
export interface CampagneSpecifiqueModelWithoutRef extends CampagneComplete {
    generic: false;
    cohortId: string;
    campagneGeneriqueId?: undefined;
    originalCampagneGeneriqueId?: string;
}

/**
 * Modèle pour une campagne spécifique avec référence à une campagne générique
 * Contient uniquement les champs de base + cohortId et campagneGeneriqueId
 * Les autres champs sont hérités de la campagne générique référencée
 */
export interface CampagneSpecifiqueModelWithRef extends CampagneBase {
    generic: false;
    cohortId: string;
    campagneGeneriqueId: string;
    envois?: CampagneEnvoi[];
}

export interface CampagneSpecifiqueModelWithRefAndGeneric extends CampagneComplete {
    generic: false;
    cohortId: string;
    campagneGeneriqueId: string;
}

// Types unions pour les différents cas d'utilisation
export type CampagneSpecifiqueModel = CampagneSpecifiqueModelWithoutRef | CampagneSpecifiqueModelWithRef;
export type CampagneModel = CampagneGeneriqueModel | CampagneSpecifiqueModel;

// Types pour la création de campagnes
export type CreateCampagneGeneriqueModel = Omit<CampagneGeneriqueModel, "id" | "createdAt" | "updatedAt" | "envois">;
export type CreateCampagneSpecifiqueModelWithoutRef = Omit<
    CampagneSpecifiqueModelWithoutRef,
    "id" | "createdAt" | "updatedAt" | "envois"
>;
export type CreateCampagneSpecifiqueModelWithRef = Omit<
    CampagneSpecifiqueModelWithRef,
    "id" | "createdAt" | "updatedAt"
>;
export type CreateCampagneSpecifiqueModel =
    | CreateCampagneSpecifiqueModelWithoutRef
    | CreateCampagneSpecifiqueModelWithRef;
export type CreateCampagneModel = CreateCampagneGeneriqueModel | CreateCampagneSpecifiqueModel;
