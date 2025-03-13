import { CampagneJeuneType, DestinataireListeDiffusion } from "./constants";

/**
 * Interface de base pour toutes les campagnes
 */
export interface CampagneBase {
  id: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

/**
 * Interface pour les campagnes avec tous les champs
 */
export interface CampagneComplete extends CampagneBase {
  nom: string;
  objet: string;
  contexte?: string;
  templateId: number;
  listeDiffusionId: string;
  destinataires: DestinataireListeDiffusion[];
  type: CampagneJeuneType;
}

/**
 * Interface pour les campagnes génériques
 */
export interface CampagneGenerique extends CampagneComplete {
  generic: true;
}

/**
 * Interface de base pour les campagnes spécifiques
 */
export interface CampagneSpecifiqueBase extends CampagneBase {
  generic: false;
  cohortId: string;
}

/**
 * Interface pour les campagnes spécifiques sans référence
 */
export interface CampagneSpecifiqueSansRef extends CampagneComplete, CampagneSpecifiqueBase {}

/**
 * Interface pour les campagnes spécifiques avec référence
 */
export interface CampagneSpecifiqueAvecRef extends CampagneSpecifiqueBase {
  campagneGeneriqueId: string;
}

/**
 * Type union pour toutes les campagnes spécifiques
 */
export type CampagneSpecifique = CampagneSpecifiqueSansRef | CampagneSpecifiqueAvecRef;

/**
 * Type union pour toutes les campagnes
 */
export type Campagne = CampagneGenerique | CampagneSpecifique;

/**
 * Types pour la création de campagnes (sans id, createdAt, updatedAt)
 */
export type CreateCampagneGenerique = Omit<CampagneGenerique, "id" | "createdAt" | "updatedAt">;
export type CreateCampagneSpecifiqueSansRef = Omit<CampagneSpecifiqueSansRef, "id" | "createdAt" | "updatedAt">;
export type CreateCampagneSpecifiqueAvecRef = Omit<CampagneSpecifiqueAvecRef, "id" | "createdAt" | "updatedAt">;
export type CreateCampagneSpecifique = CreateCampagneSpecifiqueSansRef | CreateCampagneSpecifiqueAvecRef;
export type CreateCampagne = CreateCampagneGenerique | CreateCampagneSpecifique;

/**
 * Type guards pour vérifier le type de campagne
 */

/**
 * Vérifie si une campagne est générique
 * @param campagne Objet campagne à vérifier
 * @returns true si la campagne est générique
 */
export function isCampagneGenerique<T extends { generic: boolean }>(campagne: T): campagne is T & { generic: true } {
  return campagne.generic === true;
}

/**
 * Vérifie si une campagne est spécifique
 * @param campagne Objet campagne à vérifier
 * @returns true si la campagne est spécifique
 */
export function isCampagneSpecifique<T extends { generic: boolean }>(campagne: T): campagne is T & { generic: false } {
  return campagne.generic === false;
}

/**
 * Vérifie si une campagne a une référence à une campagne générique
 * @param campagne Objet campagne à vérifier
 * @returns true si la campagne a une référence à une campagne générique
 */
export function hasCampagneGeneriqueId<T extends object>(campagne: T): campagne is T & { campagneGeneriqueId: string } {
  return "campagneGeneriqueId" in campagne && typeof (campagne as any).campagneGeneriqueId === "string";
}

/**
 * Vérifie si une campagne spécifique a une référence à une campagne générique
 * @param campagne Objet campagne à vérifier
 * @returns true si la campagne est spécifique et a une référence à une campagne générique
 */
export function isCampagneWithRef<T extends { generic: boolean }>(
  campagne: T
): campagne is T & { generic: false; campagneGeneriqueId: string } {
  return isCampagneSpecifique(campagne) && hasCampagneGeneriqueId(campagne);
}

/**
 * Vérifie si une campagne spécifique n'a pas de référence à une campagne générique
 * @param campagne Objet campagne à vérifier
 * @returns true si la campagne est spécifique et n'a pas de référence à une campagne générique
 */
export function isCampagneSansRef<T extends { generic: boolean }>(
  campagne: T
): campagne is T & { generic: false } & Omit<CampagneComplete, "id" | "createdAt" | "updatedAt"> {
  return isCampagneSpecifique(campagne) && !hasCampagneGeneriqueId(campagne);
}
