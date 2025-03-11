import { PlanMarketingRoutes, CampagneJeuneType } from "snu-lib";
import { CampagneSpecifiqueFormData } from "../CampagneSpecifiqueForm";

type CampagneApiResponse = NonNullable<PlanMarketingRoutes["SearchPlanMarketingRoute"]["response"]>[number];
type CreateCampagnePayload = PlanMarketingRoutes["CreatePlanMarketingRoute"]["payload"];
type UpdateCampagnePayload = PlanMarketingRoutes["UpdatePlanMarketingRoute"]["payload"];

interface CampagneBase {
  id: string;
  createdAt: string;
  updatedAt: string;
}

interface CampagneComplete extends CampagneBase {
  nom: string;
  objet: string;
  contexte?: string;
  templateId: number;
  listeDiffusionId: string;
  destinataires: NonNullable<CampagneSpecifiqueFormData["destinataires"]>;
  type: NonNullable<CampagneSpecifiqueFormData["type"]>;
}

interface CampagneSpecifiqueBase extends CampagneBase {
  generic: false;
  cohortId: string;
}

interface CampagneSpecifiqueWithoutRefPayload extends CampagneComplete, CampagneSpecifiqueBase {}

interface CampagneSpecifiqueWithRefPayload extends CampagneSpecifiqueBase {
  campagneGeneriqueId: string;
}

/**
 * Vérifie si une campagne est spécifique
 */
const isCampagneSpecifique = (campagne: CampagneApiResponse): campagne is CampagneApiResponse & { generic: false } => {
  return !campagne.generic;
};

/**
 * Vérifie si une campagne a une référence
 */
const hasCampagneGeneriqueId = (campagne: CampagneApiResponse): campagne is CampagneApiResponse & { campagneGeneriqueId: string } => {
  return "campagneGeneriqueId" in campagne;
};

export class CampagneSpecifiqueMapper {
  /**
   * Convertit une réponse de l'API en données de formulaire
   * @throws Error si la campagne n'est pas une campagne spécifique
   */
  static toFormData(campagne: CampagneApiResponse): CampagneSpecifiqueFormData {
    if (!isCampagneSpecifique(campagne)) {
      throw new Error("La campagne n'est pas une campagne spécifique");
    }

    // Si c'est une campagne avec référence, on fournit des valeurs par défaut pour les champs requis
    if (hasCampagneGeneriqueId(campagne)) {
      return {
        id: campagne.id,
        cohortId: campagne.cohortId,
        createdAt: campagne.createdAt,
        updatedAt: campagne.updatedAt,
        // TODO: Ajouter la partie des données de la campagne générique
        // car les champs sont portés par compagneGenericId (campagne parent)
        nom: "",
        type: CampagneJeuneType.VOLONTAIRE,
        listeDiffusionId: "",
        templateId: 0,
        objet: "",
        destinataires: [],
      };
    }

    // Si c'est une campagne sans référence, on garde tous les champs
    return {
      id: campagne.id,
      nom: campagne.nom,
      type: campagne.type,
      listeDiffusionId: campagne.listeDiffusionId,
      templateId: campagne.templateId,
      objet: campagne.objet,
      destinataires: campagne.destinataires,
      contexte: campagne.contexte,
      cohortId: campagne.cohortId,
      createdAt: campagne.createdAt,
      updatedAt: campagne.updatedAt,
    };
  }

  /**
   * Convertit des données de formulaire en payload pour la création
   */
  static toCreatePayload(formData: CampagneSpecifiqueFormData & { generic: false }): CreateCampagnePayload {
    // Si c'est une campagne avec référence
    if ("campagneGeneriqueId" in formData && typeof formData.campagneGeneriqueId === "string") {
      const payload: Omit<CampagneSpecifiqueWithRefPayload, "id" | "createdAt" | "updatedAt"> = {
        generic: false,
        cohortId: formData.cohortId,
        campagneGeneriqueId: formData.campagneGeneriqueId,
      };
      return payload;
    }

    // Si c'est une campagne sans référence
    const payload: Omit<CampagneSpecifiqueWithoutRefPayload, "id" | "createdAt" | "updatedAt"> = {
      nom: formData.nom,
      type: formData.type,
      listeDiffusionId: formData.listeDiffusionId,
      templateId: formData.templateId,
      objet: formData.objet,
      destinataires: formData.destinataires,
      contexte: formData.contexte,
      cohortId: formData.cohortId,
      generic: false,
    };
    return payload;
  }

  /**
   * Convertit des données de formulaire en payload pour la mise à jour
   */
  static toUpdatePayload(formData: CampagneSpecifiqueFormData & { generic: false } & { id: string }): UpdateCampagnePayload {
    const now = new Date().toISOString();

    // Si c'est une campagne avec référence
    if ("campagneGeneriqueId" in formData && typeof formData.campagneGeneriqueId === "string") {
      const payload: CampagneSpecifiqueWithRefPayload = {
        id: formData.id,
        generic: false,
        cohortId: formData.cohortId,
        campagneGeneriqueId: formData.campagneGeneriqueId,
        createdAt: formData.createdAt || now,
        updatedAt: now,
      };
      return payload;
    }

    // Si c'est une campagne sans référence
    const payload: CampagneSpecifiqueWithoutRefPayload = {
      id: formData.id,
      nom: formData.nom,
      type: formData.type,
      listeDiffusionId: formData.listeDiffusionId,
      templateId: formData.templateId,
      objet: formData.objet,
      destinataires: formData.destinataires,
      contexte: formData.contexte,
      cohortId: formData.cohortId,
      generic: false,
      createdAt: formData.createdAt || now,
      updatedAt: now,
    };
    return payload;
  }
}
