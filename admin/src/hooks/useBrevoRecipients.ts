import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
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

export const useBrevoRecipients = (tab: "volontaire" | "inscription") => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [youngs, setYoungs] = useState<YoungCustomType[]>([]);

  // Collecter tous les IDs de référents nécessaires
  const referentIds = useMemo(() => {
    const ids = new Set<string>();

    youngs.forEach((young) => {
      // Référents de classe
      young.classe?.referentClasseIds?.forEach((id) => ids.add(id));
      // Chefs d'établissement
      young.etablissement?.referentEtablissementIds?.forEach((id) => ids.add(id));
      // Coordinateurs CLE
      young.etablissement?.coordinateurIds?.forEach((id) => ids.add(id));
      // Chefs de centre
      if (young.sessionPhase1?.headCenterId) {
        ids.add(young.sessionPhase1.headCenterId);
      }
    });

    return ids;
  }, [youngs]);

  // Récupération des référents
  const { data: referents, isLoading: isLoadingReferents } = useQuery({
    queryKey: ["referents", Array.from(referentIds)],
    queryFn: () => BrevoRecipientsService.getReferentsByIds([...referentIds]),
    enabled: referentIds.size > 0,
    refetchOnWindowFocus: false,
  });

  const validateData = (youngs: YoungCustomType[], selectedTypes: RecipientType[]) => {
    const missingData = youngs.some((young) => {
      if (selectedTypes.includes("referents") && (!young.classe?.referentClasseIds || young.classe.referentClasseIds.length === 0)) {
        console.error(`Referents manquants pour la classe ${young.classe?.name || "inconnue"}`);
        return `Referents manquants pour la classe ${young.classe?.name || "inconnue"}`;
      }

      if (selectedTypes.includes("chefs-etablissement") && (!young.etablissement?.referentEtablissementIds || young.etablissement.referentEtablissementIds.length === 0)) {
        console.error(`Chef d'établissement manquant pour l'établissement ${young.etablissement?.name || "inconnu"}`);
        return `Chef d'établissement manquant pour l'établissement ${young.etablissement?.name || "inconnu"}`;
      }

      if (selectedTypes.includes("administrateurs") && (!young.etablissement?.coordinateurIds || young.etablissement.coordinateurIds.length === 0)) {
        console.error(`Coordinateurs manquants pour l'établissement ${young.etablissement?.name || "inconnu"}`);
        return `Coordinateurs manquants pour l'établissement ${young.etablissement?.name || "inconnu"}`;
      }

      if (selectedTypes.includes("chefs-centres") && !young.sessionPhase1Id) {
        console.error(`Session manquante pour le jeune ${young.firstName} ${young.lastName}`);
        return `Session manquante pour le jeune ${young.firstName} ${young.lastName}`;
      }

      return false;
    });

    if (missingData) {
      throw new Error("Données manquantes pour certains destinataires sélectionnés");
    }
  };

  const processRecipients = async (selectedTypes: RecipientType[], filters: FiltersYoungsForExport): Promise<BrevoRecipient[]> => {
    setIsProcessing(true);

    try {
      const youngs = await BrevoRecipientsService.getFilteredYoungsForExport(filters, tab);

      // Validation des données selon les types sélectionnés
      validateData(youngs, selectedTypes);

      setYoungs(youngs);
      const recipientsMap = new Map<string, BrevoRecipient>();
      const referentsMap = new Map(referents?.data?.map((r) => [r._id, r]));

      // Une seule boucle pour traiter tous les types
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

      return Array.from(recipientsMap.values());
    } catch (error) {
      console.error("Erreur lors du traitement des destinataires:", error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    processRecipients,
    isLoading: isProcessing || isLoadingReferents,
  };
};
