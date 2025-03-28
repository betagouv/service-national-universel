import { PlanMarketingRoutes, isCampagneSpecifique, hasCampagneGeneriqueId, CampagneEnvoi } from "snu-lib";
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
  envois?: CampagneEnvoi[];
}

interface CampagneSpecifiqueBase extends CampagneBase {
  generic: false;
  cohortId: string;
}

interface CampagneSpecifiqueWithoutRefPayload extends CampagneComplete, CampagneSpecifiqueBase {}

interface CampagneSpecifiqueWithRefPayload extends CampagneSpecifiqueBase {
  campagneGeneriqueId: string;
}

export class CampagneSpecifiqueMapper {
  /**
   * Convertit une réponse de l'API en données de formulaire
   * @throws Error si la campagne n'est pas une campagne spécifique
   */
  static toFormData(campagne: CampagneApiResponse): CampagneSpecifiqueFormData & { envois: CampagneEnvoi[] | undefined } {
    if (!isCampagneSpecifique(campagne)) {
      throw new Error("La campagne n'est pas une campagne spécifique");
    }

    // Si c'est une campagne sans référence, on garde tous les champs
    return {
      id: campagne.id,
      generic: false,
      nom: campagne.nom,
      type: campagne.type,
      listeDiffusionId: campagne.listeDiffusionId,
      templateId: campagne.templateId,
      objet: campagne.objet,
      destinataires: campagne.destinataires,
      contexte: campagne.contexte,
      cohortId: campagne.cohortId,
      campagneGeneriqueId: campagne.campagneGeneriqueId,
      envois: campagne.envois,
      createdAt: campagne.createdAt,
      updatedAt: campagne.updatedAt,
    };
  }

  /**
   * Convertit des données de formulaire en payload pour la création
   */
  static toCreatePayload(formData: CampagneSpecifiqueFormData & { generic: false }): CreateCampagnePayload {
    // Si c'est une campagne avec référence
    if (hasCampagneGeneriqueId(formData) && typeof formData.campagneGeneriqueId === "string") {
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
      envois: formData.envois,
    };
    return payload;
  }

  /**
   * Convertit des données de formulaire en payload pour la mise à jour
   */
  static toUpdatePayload(formData: CampagneSpecifiqueFormData & { generic: false } & { id: string }): UpdateCampagnePayload {
    const now = new Date().toISOString();

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
      envois: formData.envois,
      createdAt: formData.createdAt || now,
      updatedAt: now,
    };
    return payload;
  }
}
