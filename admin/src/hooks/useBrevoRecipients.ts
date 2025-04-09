import { useMutation } from "@tanstack/react-query";
import { toastr } from "react-redux-toastr";
import {
  YoungType,
  isChefEtablissement,
  isCoordinateurEtablissement,
  isReferentClasse,
  isHeadCenter,
  isHeadCenterAdjoint,
  isReferentSanitaire,
  ClasseType,
  EtablissementType,
  CohesionCenterType,
  SessionPhase1Type,
  PointDeRassemblementType,
  LigneBusType,
  formatDateFR,
  LigneToPointType,
  ReferentType,
} from "snu-lib";
import { BrevoRecipientsService, FiltersYoungsForExport } from "@/services/brevoRecipientsService";

export type RecipientType =
  | "jeunes"
  | "referents"
  | "chefs-etablissement"
  | "representants"
  | "chefs-centres"
  | "chefs-centres-adjoint"
  | "referents-sanitaires"
  | "administrateurs";

export interface BrevoRecipient {
  type: RecipientType;
  PRENOM: string;
  NOM: string;
  PRENOMVOLONTAIRE: string;
  NOMVOLONTAIRE: string;
  EMAIL: string;
  COHORT?: string;
  CENTRE?: string;
  VILLECENTRE?: string;
  PDR_ALLER?: string;
  PDR_ALLER_ADRESSE?: string;
  PDR_ALLER_VILLE?: string;
  DATE_ALLER?: string;
  HEURE_ALLER?: string;
  PDR_RETOUR?: string;
  PDR_RETOUR_VILLE?: string;
  PDR_RETOUR_ADRESSE?: string;
  DATE_RETOUR?: string;
  HEURE_RETOUR?: string;
}

type YoungCustomType = YoungType & {
  classe: ClasseType;
  etablissement: EtablissementType;
  center: CohesionCenterType;
  sessionPhase1: SessionPhase1Type;
  meetingPoint: PointDeRassemblementType;
  ligneToPoint: LigneToPointType;
  bus: LigneBusType;
};

type RecipientErrorCode = "VALIDATION_ERROR" | "PROCESSING_ERROR" | "FETCH_ERROR" | "RECIPIENT_NOT_FOUND";

interface BaseRecipientError {
  code: RecipientErrorCode;
  message: string;
}

interface RecipientValidationError extends BaseRecipientError {
  code: "VALIDATION_ERROR";
  details: {
    youngId?: string;
    firstName?: string;
    lastName?: string;
    type: string;
    missing: string;
  }[];
}

interface RecipientProcessingError extends BaseRecipientError {
  code: "PROCESSING_ERROR";
  originalError: unknown;
}

interface RecipientFetchError extends BaseRecipientError {
  code: "FETCH_ERROR";
  originalError: unknown;
}

interface RecipientNotFoundError extends BaseRecipientError {
  code: "RECIPIENT_NOT_FOUND";
  originalError: unknown;
}

type RecipientNotificationError = RecipientValidationError | RecipientProcessingError | RecipientFetchError | RecipientNotFoundError;

// Validation des données obligatoire des jeunes
const validateYoungData = (young: YoungCustomType): { isValid: true } | { isValid: false; error: RecipientValidationError["details"][0] } => {
  if (!young.firstName || !young.lastName || !young.email || !young.cohort) {
    return {
      isValid: false,
      error: {
        youngId: young._id,
        firstName: young.firstName,
        lastName: young.lastName,
        type: "informations obligatoires",
        missing: "informations générales",
      },
    };
  }

  return { isValid: true };
};

// Validation Stricte pour retrouver les destinaires en fonction du jeune + associations
// Validation Stricte: génère une erreur si le jeune ne possède pas les informations requises pour retrouver un destinataire
const validateYoungDataStrict = (young: YoungCustomType, selectedTypes: RecipientType[]): { isValid: true } | { isValid: false; error: RecipientValidationError["details"][0] } => {
  const isTransportRequired = selectedTypes.includes("jeunes") || selectedTypes.includes("representants");
  if (isTransportRequired) {
    if (!young.center) {
      return {
        isValid: false,
        error: {
          youngId: young._id,
          firstName: young.firstName,
          lastName: young.lastName,
          type: "transport",
          missing: "centre d'affectation",
        },
      };
    }

    if (!young.meetingPoint) {
      return {
        isValid: false,
        error: {
          youngId: young._id,
          firstName: young.firstName,
          lastName: young.lastName,
          type: "transport",
          missing: "point de rassemblement",
        },
      };
    }

    if (!young.bus) {
      return {
        isValid: false,
        error: {
          youngId: young._id,
          firstName: young.firstName,
          lastName: young.lastName,
          type: "transport",
          missing: "bus",
        },
      };
    }

    if (!young.ligneToPoint) {
      return {
        isValid: false,
        error: {
          youngId: young._id,
          firstName: young.firstName,
          lastName: young.lastName,
          type: "transport",
          missing: "ligne de bus",
        },
      };
    }
  }

  if (selectedTypes.includes("referents") && !young.classe?.referentClasseIds?.length) {
    return {
      isValid: false,
      error: {
        youngId: young._id,
        firstName: young.firstName,
        lastName: young.lastName,
        type: "referents",
        missing: "référents de classe",
      },
    };
  }

  if (selectedTypes.includes("chefs-etablissement") && !young.etablissement?.referentEtablissementIds?.length) {
    return {
      isValid: false,
      error: {
        youngId: young._id,
        firstName: young.firstName,
        lastName: young.lastName,
        type: "chefs-etablissement",
        missing: "chef d'établissement",
      },
    };
  }

  if (selectedTypes.includes("administrateurs") && !young.etablissement?.coordinateurIds?.length) {
    return {
      isValid: false,
      error: {
        youngId: young._id,
        firstName: young.firstName,
        lastName: young.lastName,
        type: "administrateurs",
        missing: "coordinateurs",
      },
    };
  }

  if (selectedTypes.includes("chefs-centres") && !young.sessionPhase1Id) {
    return {
      isValid: false,
      error: {
        youngId: young._id,
        firstName: young.firstName,
        lastName: young.lastName,
        type: "chefs-centres",
        missing: "session de phase 1",
      },
    };
  }

  const transportValidation = validateYoungData(young);
  if (!transportValidation.isValid) {
    return transportValidation;
  }

  return { isValid: true };
};

const fillCommonFields = (young: YoungCustomType): Omit<BrevoRecipient, "type" | "PRENOM" | "NOM" | "EMAIL"> => {
  return {
    COHORT: young.cohort,
    PRENOMVOLONTAIRE: young.firstName!,
    NOMVOLONTAIRE: young.lastName!,
    CENTRE: young.center?.name || "",
    VILLECENTRE: young.center?.city || "",
    PDR_ALLER: young.meetingPoint?.name || "",
    PDR_ALLER_ADRESSE: young.meetingPoint?.address || "",
    PDR_ALLER_VILLE: young.meetingPoint?.city || "",
    DATE_ALLER: young.bus?.departuredDate ? formatDateFR(young.bus.departuredDate) : "",
    HEURE_ALLER: young.ligneToPoint?.departureHour || "",
    PDR_RETOUR: young.meetingPoint?.name || "",
    PDR_RETOUR_VILLE: young.meetingPoint?.address || "",
    PDR_RETOUR_ADRESSE: young.meetingPoint?.city || "",
    DATE_RETOUR: young.bus?.returnDate ? formatDateFR(young.bus.returnDate) : "",
    HEURE_RETOUR: young.ligneToPoint?.returnHour || "",
  };
};

const formatValidationErrorMessage = (errors: RecipientValidationError["details"]) => {
  const groupedErrors = errors.reduce(
    (acc, error) => {
      if (!acc[error.type]) {
        acc[error.type] = [];
      }
      acc[error.type].push(error);
      return acc;
    },
    {} as Record<string, typeof errors>,
  );

  const toastrMessage = Object.entries(groupedErrors)
    .map(([type, typeErrors]) => {
      const count = typeErrors.length;
      const typeName =
        {
          referents: "référents de classe",
          "chefs-etablissement": "chefs d'établissement",
          administrateurs: "coordinateurs",
          "chefs-centres": "chefs de centre",
          transport: "informations de transport",
        }[type] || type;

      return `${count} volontaire${count > 1 ? "s" : ""} sans ${typeName}`;
    })
    .join(", ");

  return {
    toastr: `Données manquantes : ${toastrMessage}`,
    details: Object.entries(groupedErrors)
      .map(([, typeErrors]) => typeErrors.map((error) => `[${error.youngId}] ${error.firstName} ${error.lastName} - ${error.missing} manquant(s)`).join("\n"))
      .join("\n"),
  };
};

const validateData = (youngs: YoungCustomType[], selectedTypes: RecipientType[], strict: boolean = false): void => {
  const validationErrors: RecipientValidationError["details"] = [];
  const validateFn = strict ? validateYoungDataStrict : validateYoungData;

  youngs.forEach((young) => {
    const validation = validateFn(young, selectedTypes);
    if (!validation.isValid) {
      validationErrors.push(validation.error);
    }
  });

  if (validationErrors.length > 0) {
    const errorMessage = formatValidationErrorMessage(validationErrors);
    toastr.error(errorMessage.toastr, "", { timeOut: 10000 });

    throw {
      code: "VALIDATION_ERROR",
      message: errorMessage.details,
      details: validationErrors,
    } as RecipientValidationError;
  }
};

export const useBrevoRecipients = (tab: "volontaire" | "inscription") => {
  // Mutation pour récupérer les jeunes
  const fetchYoungsMutation = useMutation({
    mutationFn: async ({ filters, selectedTypes }: { filters: FiltersYoungsForExport; selectedTypes: RecipientType[] }) => {
      const youngs = await BrevoRecipientsService.getFilteredYoungsForExport(filters, tab);
      validateData(youngs, selectedTypes);
      return youngs;
    },
    onError: (error) => {
      toastr.error("Erreur lors de la récupération des données", "", { timeOut: 5000 });
      throw {
        code: "FETCH_ERROR",
        message: "Erreur lors de la récupération des données",
        originalError: error,
      } as RecipientFetchError;
    },
  });

  // Mutation pour récupérer les référents
  const fetchReferentsMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const response = await BrevoRecipientsService.getReferentsByIds(ids);
      return response.data;
    },
    onError: (error) => {
      toastr.error("Erreur lors de la récupération des référents", "", { timeOut: 5000 });
      throw {
        code: "FETCH_ERROR",
        message: "Erreur lors de la récupération des référents",
        originalError: error,
      } as RecipientFetchError;
    },
  });

  // Mutation pour traiter les recipients
  const processRecipientsMutation = useMutation({
    mutationFn: async ({ youngs, referents, selectedTypes }: { youngs: YoungCustomType[]; referents: any[] | undefined; selectedTypes: RecipientType[] }) => {
      const recipientsMap = new Map<string, BrevoRecipient>();
      const referentsMap = referents ? new Map(referents.map((r) => [r._id, r])) : new Map();

      youngs.forEach((young: YoungCustomType) => {
        // Jeunes
        if (selectedTypes.includes("jeunes")) {
          recipientsMap.set(young.email, {
            type: "jeunes",
            PRENOM: young.firstName!,
            NOM: young.lastName!,
            EMAIL: young.email,
            ...fillCommonFields(young),
          });
        }

        // Représentants légaux
        if (selectedTypes.includes("representants")) {
          if (young.parent1Email) {
            recipientsMap.set(young.parent1Email, {
              PRENOM: young.parent1FirstName || "",
              NOM: young.parent1LastName || "",
              EMAIL: young.parent1Email,
              type: "representants",
              ...fillCommonFields(young),
            });
          }
          if (young.parent2Email) {
            recipientsMap.set(young.parent2Email, {
              PRENOM: young.parent2FirstName || "",
              NOM: young.parent2LastName || "",
              EMAIL: young.parent2Email,
              type: "representants",
              ...fillCommonFields(young),
            });
          }
        }

        // Référents de classe
        if (selectedTypes.includes("referents") && young.classe?.referentClasseIds) {
          young.classe.referentClasseIds.forEach((refId) => {
            const referent = referentsMap.get(refId);
            if (referent && isReferentClasse(referent)) {
              recipientsMap.set(referent._id, {
                PRENOM: referent.firstName!,
                NOM: referent.lastName!,
                EMAIL: referent.email,
                type: "referents",
                ...fillCommonFields(young),
              });
            }
          });
        }

        // Chefs d'établissement
        if (selectedTypes.includes("chefs-etablissement") && young.etablissement?.referentEtablissementIds) {
          young.etablissement.referentEtablissementIds.forEach((refId) => {
            const referent = referentsMap.get(refId);
            if (referent && isChefEtablissement(referent)) {
              recipientsMap.set(referent._id, {
                PRENOM: referent.firstName!,
                NOM: referent.lastName!,
                EMAIL: referent.email,
                type: "chefs-etablissement",
                ...fillCommonFields(young),
              });
            }
          });
        }

        // Coordinateurs CLE
        if (selectedTypes.includes("administrateurs") && young.etablissement?.coordinateurIds) {
          young.etablissement.coordinateurIds.forEach((coordId) => {
            const coordinator = referentsMap.get(coordId);
            if (coordinator && isCoordinateurEtablissement(coordinator)) {
              recipientsMap.set(coordinator._id, {
                PRENOM: coordinator.firstName!,
                NOM: coordinator.lastName!,
                EMAIL: coordinator.email,
                type: "administrateurs",
                ...fillCommonFields(young),
              });
            }
          });
        }

        // Chefs de centre
        if (selectedTypes.includes("chefs-centres") && young.sessionPhase1?.headCenterId) {
          const headCenter = referentsMap.get(young.sessionPhase1.headCenterId!);
          if (headCenter && isHeadCenter(headCenter)) {
            recipientsMap.set(headCenter._id, {
              PRENOM: headCenter.firstName!,
              NOM: headCenter.lastName!,
              EMAIL: headCenter.email,
              type: "chefs-centres",
              ...fillCommonFields(young),
            });
          }
        }

        // Chefs de centre adjoint
        if (selectedTypes.includes("chefs-centres-adjoint") && young.sessionPhase1?.adjointsIds) {
          young.sessionPhase1.adjointsIds.forEach((adjointId) => {
            const headCenterAdjoint = referentsMap.get(adjointId);
            if (headCenterAdjoint && isHeadCenterAdjoint(headCenterAdjoint)) {
              recipientsMap.set(headCenterAdjoint._id, {
                PRENOM: headCenterAdjoint.firstName!,
                NOM: headCenterAdjoint.lastName!,
                EMAIL: headCenterAdjoint.email,
                type: "chefs-centres-adjoint",
                ...fillCommonFields(young),
              });
            }
          });
        }

        // Referents Sanitaires
        if (selectedTypes.includes("referents-sanitaires") && young.sessionPhase1?.adjointsIds) {
          young.sessionPhase1.adjointsIds.forEach((adjointId) => {
            const referentSanitaire = referentsMap.get(adjointId);
            if (referentSanitaire && isReferentSanitaire(referentSanitaire)) {
              recipientsMap.set(referentSanitaire._id, {
                PRENOM: referentSanitaire.firstName!,
                NOM: referentSanitaire.lastName!,
                EMAIL: referentSanitaire.email,
                type: "referents-sanitaires",
                ...fillCommonFields(young),
              });
            }
          });
        }
      });

      if (recipientsMap.size === 0) {
        const error: RecipientNotFoundError = {
          code: "RECIPIENT_NOT_FOUND",
          message: "Aucun destinataire trouvé",
          originalError: null,
        };
        throw error;
      }

      return Array.from(recipientsMap.values());
    },
    onError: (error: unknown) => {
      const recipientError = error as RecipientNotificationError;
      if (recipientError.code === "RECIPIENT_NOT_FOUND") {
        toastr.error("Erreur lors du traitement des destinataires", "Aucun destinataire trouvé", { timeOut: 5000 });
      } else {
        toastr.error("Erreur lors du traitement des destinataires", "", { timeOut: 5000 });
      }
      throw recipientError;
    },
  });

  const processRecipients = async (selectedTypes: RecipientType[], filters: FiltersYoungsForExport) => {
    // 1. Récupérer les jeunes
    const youngs = await fetchYoungsMutation.mutateAsync({ filters, selectedTypes });

    const referentIds = new Set<string>();
    youngs.forEach((young) => {
      young.classe?.referentClasseIds?.forEach((id) => referentIds.add(id));
      young.etablissement?.referentEtablissementIds?.forEach((id) => referentIds.add(id));
      young.etablissement?.coordinateurIds?.forEach((id) => referentIds.add(id));
      if (young.sessionPhase1?.headCenterId) referentIds.add(young.sessionPhase1.headCenterId);
    });

    let referents: ReferentType[] = [];
    // 2. Récupérer les référents si nécessaire
    if (referentIds.size > 0) {
      referents = (await fetchReferentsMutation.mutateAsync([...referentIds])) || [];
    }

    // 3. Traiter les recipients
    return await processRecipientsMutation.mutateAsync({ youngs, referents, selectedTypes });
  };

  return {
    processRecipients,
    isLoading: fetchYoungsMutation.isPending || fetchReferentsMutation.isPending || processRecipientsMutation.isPending,
    error: fetchYoungsMutation.error || fetchReferentsMutation.error || processRecipientsMutation.error,
  };
};
