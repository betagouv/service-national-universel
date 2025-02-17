import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toastr } from "react-redux-toastr";
import {
  YoungType,
  isChefEtablissement,
  isCoordinateurEtablissement,
  isReferentClasse,
  isHeadCenter,
  ClasseType,
  EtablissementType,
  CohesionCenterType,
  SessionPhase1Type,
  PointDeRassemblementType,
  LigneBusType,
  formatDateFR,
  LigneToPointType,
} from "snu-lib";
import { BrevoRecipientsService, FiltersYoungsForExport } from "@/services/brevoRecipientsService";

export type RecipientType = "jeunes" | "referents" | "chefs-etablissement" | "representants" | "chefs-centres" | "administrateurs";

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

const fillCommonFields = (young: YoungCustomType): Omit<BrevoRecipient, "type" | "PRENOM" | "NOM" | "EMAIL"> => {
  return {
    COHORT: young.cohort,
    CENTRE: young.center.name,
    VILLECENTRE: young.center.city,
    PRENOMVOLONTAIRE: young.firstName!,
    NOMVOLONTAIRE: young.lastName!,
    PDR_ALLER: young.meetingPoint.name,
    PDR_ALLER_ADRESSE: young.meetingPoint.address,
    PDR_ALLER_VILLE: young.meetingPoint.city,
    DATE_ALLER: formatDateFR(young.bus.departuredDate),
    HEURE_ALLER: young.ligneToPoint.departureHour,
    PDR_RETOUR: young.meetingPoint.name,
    PDR_RETOUR_VILLE: young.meetingPoint.address,
    PDR_RETOUR_ADRESSE: young.meetingPoint.city,
    DATE_RETOUR: formatDateFR(young.bus.returnDate),
    HEURE_RETOUR: young.ligneToPoint.returnHour,
  };
};

interface RecipientValidationError {
  code: "VALIDATION_ERROR";
  message: string;
  details: {
    youngId?: string;
    firstName?: string;
    lastName?: string;
    type: string;
    missing: string;
  }[];
}

interface RecipientProcessingError {
  code: "PROCESSING_ERROR";
  message: string;
  originalError: unknown;
}

interface RecipientFetchError {
  code: "FETCH_ERROR";
  message: string;
  originalError: unknown;
}

type RecipientNotificationError = RecipientValidationError | RecipientProcessingError | RecipientFetchError;

const validateYoungData = (young: YoungCustomType, selectedTypes: RecipientType[]): { isValid: true } | { isValid: false; error: RecipientValidationError["details"][0] } => {
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

  return { isValid: true };
};

export const useBrevoRecipients = (tab: "volontaire" | "inscription") => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [youngs, setYoungs] = useState<YoungCustomType[]>([]);
  const [error, setError] = useState<RecipientNotificationError | null>(null);

  const referentIds = useMemo(() => {
    const ids = new Set<string>();
    youngs.forEach((young) => {
      young.classe?.referentClasseIds?.forEach((id) => ids.add(id));
      young.etablissement?.referentEtablissementIds?.forEach((id) => ids.add(id));
      young.etablissement?.coordinateurIds?.forEach((id) => ids.add(id));
      if (young.sessionPhase1?.headCenterId) ids.add(young.sessionPhase1.headCenterId);
    });
    return ids;
  }, [youngs]);

  const { data: referents, isLoading: isLoadingReferents } = useQuery({
    queryKey: ["referents", Array.from(referentIds)],
    queryFn: () => BrevoRecipientsService.getReferentsByIds([...referentIds]),
    enabled: referentIds.size > 0,
    refetchOnWindowFocus: false,
  });

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

  const validateData = (youngs: YoungCustomType[], selectedTypes: RecipientType[]): void => {
    const validationErrors: RecipientValidationError["details"] = [];

    youngs.forEach((young) => {
      const validation = validateYoungData(young, selectedTypes);
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

  const processRecipients = async (selectedTypes: RecipientType[], filters: FiltersYoungsForExport): Promise<BrevoRecipient[]> => {
    setIsProcessing(true);
    setError(null);

    try {
      const youngs = await BrevoRecipientsService.getFilteredYoungsForExport(filters, tab).catch((error) => {
        toastr.error("Erreur lors de la récupération des données", "", { timeOut: 5000 });
        throw {
          code: "FETCH_ERROR",
          message: "Erreur lors de la récupération des données",
          originalError: error,
        } as RecipientFetchError;
      });

      validateData(youngs, selectedTypes);
      setYoungs(youngs);

      const recipientsMap = new Map<string, BrevoRecipient>();
      const referentsMap = referents?.data ? new Map(referents?.data?.map((r) => [r._id, r])) : new Map<string, any>();

      try {
        // Traitement des destinataires avec vérification des erreurs
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
          if (selectedTypes.includes("chefs-centres") && young.sessionPhase1.headCenterId) {
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
        });
      } catch (error) {
        toastr.error("Erreur lors du traitement des destinataires", "", { timeOut: 5000 });
        throw {
          code: "PROCESSING_ERROR",
          message: "Erreur lors du traitement des destinataires",
          originalError: error,
        } as RecipientProcessingError;
      }

      return Array.from(recipientsMap.values());
    } catch (error) {
      const recipientError = error as RecipientNotificationError;
      setError(recipientError);
      throw recipientError;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    processRecipients,
    isLoading: isProcessing || isLoadingReferents,
    error,
    clearError: () => setError(null),
  };
};

export const formatRecipientError = (error: RecipientNotificationError): string => {
  switch (error.code) {
    case "VALIDATION_ERROR":
      return `${error.message}\n${error.details.map((detail) => `- ${detail.firstName} ${detail.lastName}: ${detail.missing} manquant(s)`).join("\n")}`;

    case "PROCESSING_ERROR":
      return `Une erreur est survenue lors du traitement des données: ${error.message}`;

    case "FETCH_ERROR":
      return `Erreur lors de la récupération des données: ${error.message}`;

    default:
      return "Une erreur inconnue est survenue";
  }
};
