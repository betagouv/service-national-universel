import { useMemo, useState } from "react";
import { QueryObserverResult, useQuery } from "@tanstack/react-query";
import { ClasseType, EtablissementType, ROLES, RouteResponseBody, SessionPhase1Type, YoungType } from "snu-lib";
import { BrevoRecipientsService } from "@/services/brevoRecipientsService";

type RecipientType = "jeunes" | "referents" | "chefs-etablissement" | "representants" | "chefs-centres" | "administrateurs";

interface Recipient {
  firstName: string;
  lastName: string;
  email: string;
  cohort?: string;
  type: RecipientType;
}

type QueryResult = Promise<
  | QueryObserverResult<RouteResponseBody<ClasseType[]>, Error>
  | QueryObserverResult<RouteResponseBody<SessionPhase1Type[]>, Error>
  | QueryObserverResult<RouteResponseBody<EtablissementType[]>, Error>
>;

export const useBrevoRecipients = (youngs: YoungType[]) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedRecipientTypes, setSelectedRecipientTypes] = useState<RecipientType[]>([]);

  // --- Préparation des IDs ---
  const uniqueIds = useMemo(() => {
    const ids = {
      classIds: new Set<string>(),
      sessionIds: new Set<string>(),
      establishmentIds: new Set<string>(),
    };

    youngs.forEach((young) => {
      if (young.classeId) ids.classIds.add(young.classeId);
      if (young.sessionPhase1Id) ids.sessionIds.add(young.sessionPhase1Id);
      if (young.etablissementId) ids.establishmentIds.add(young.etablissementId);
    });

    return ids;
  }, [youngs]);

  // --- Requêtes ---
  // Classes
  const classesQuery = useQuery({
    queryKey: ["classes", Array.from(uniqueIds.classIds)],
    queryFn: () => BrevoRecipientsService.getClassesByIds([...uniqueIds.classIds]),
    enabled: isProcessing && selectedRecipientTypes.includes("referents") && uniqueIds.classIds.size > 0,
  });

  // Sessions pour les chefs de centre
  const sessionsQuery = useQuery({
    queryKey: ["sessions", Array.from(uniqueIds.sessionIds)],
    queryFn: () => BrevoRecipientsService.getSessionsPhase1ByIds([...uniqueIds.sessionIds]),
    enabled: isProcessing && selectedRecipientTypes.includes("chefs-centres") && uniqueIds.sessionIds.size > 0,
  });

  // Établissements pour les chefs d'établissement et coordinateurs
  const establishmentsQuery = useQuery({
    queryKey: ["establishments", Array.from(uniqueIds.establishmentIds)],
    queryFn: () => BrevoRecipientsService.getEtablissementsByIds([...uniqueIds.establishmentIds]),
    enabled: isProcessing && (selectedRecipientTypes.includes("chefs-etablissement") || selectedRecipientTypes.includes("administrateurs")) && uniqueIds.establishmentIds.size > 0,
  });

  // Collecter tous les IDs de référents nécessaires
  const referentIds = useMemo(() => {
    const ids = new Set<string>();

    // Référents de classe
    classesQuery.data?.data?.forEach((c) => c.referentClasseIds?.forEach((id) => ids.add(id)));

    // Chefs de centre
    sessionsQuery.data?.data?.forEach((s) => {
      if (s.headCenterId) ids.add(s.headCenterId);
    });

    // Chefs d'établissement et coordinateurs
    establishmentsQuery.data?.data?.forEach((e) => {
      e.referentEtablissementIds?.forEach((id) => ids.add(id));
      e.coordinateurIds?.forEach((id) => ids.add(id));
    });

    return ids;
  }, [classesQuery.data, sessionsQuery.data, establishmentsQuery.data]);

  // Récupération de tous les référents
  const referentsQuery = useQuery({
    queryKey: ["referents", Array.from(referentIds)],
    queryFn: () => BrevoRecipientsService.getReferentsByIds([...referentIds]),
    enabled: isProcessing && referentIds.size > 0,
  });

  const processRecipients = async (selectedTypes: RecipientType[]): Promise<Recipient[]> => {
    setSelectedRecipientTypes(selectedTypes);
    setIsProcessing(true);

    // Refetch des données nécessaires
    const queries: QueryResult[] = [];
    if (selectedTypes.includes("referents")) queries.push(classesQuery.refetch());
    if (selectedTypes.includes("chefs-centres")) queries.push(sessionsQuery.refetch());
    if (selectedTypes.includes("chefs-etablissement") || selectedTypes.includes("administrateurs")) {
      queries.push(establishmentsQuery.refetch());
    }

    if (queries.length > 0) {
      await Promise.all(queries);
      if (referentIds.size > 0) await referentsQuery.refetch();
    }

    const recipientsMap = new Map<string, Recipient>();

    // Création des Maps pour accès rapide
    const classesMap = new Map(classesQuery.data?.data?.map((c) => [c._id, c]));
    const sessionsMap = new Map(sessionsQuery.data?.data?.map((s) => [s._id, s]));
    const establishmentsMap = new Map(establishmentsQuery.data?.data?.map((e) => [e._id, e]));
    const referentsMap = new Map(referentsQuery.data?.data?.map((r) => [r._id, r]));

    // Traitement des destinataires
    youngs.forEach((young) => {
      // Jeunes
      if (selectedTypes.includes("jeunes")) {
        recipientsMap.set(young.email, {
          firstName: young.firstName!,
          lastName: young.lastName!,
          email: young.email,
          cohort: young.cohort,
          type: "jeunes",
        });
      }

      // Représentants légaux
      if (selectedTypes.includes("representants")) {
        if (young.parent1Email) {
          recipientsMap.set(young.parent1Email, {
            firstName: young.parent1FirstName || "",
            lastName: young.parent1LastName || "",
            email: young.parent1Email,
            type: "representants",
          });
        }
        if (young.parent2Email) {
          recipientsMap.set(young.parent2Email, {
            firstName: young.parent2FirstName || "",
            lastName: young.parent2LastName || "",
            email: young.parent2Email,
            type: "representants",
          });
        }
      }

      // Référents de classe
      if (selectedTypes.includes("referents") && young.classeId) {
        const classData = classesMap.get(young.classeId);
        if (classData) {
          classData.referentClasseIds.forEach((refId) => {
            const referent = referentsMap.get(refId);
            if (referent?.role === ROLES.REFERENT_CLASSE) {
              recipientsMap.set(referent.email, {
                firstName: referent.firstName!,
                lastName: referent.lastName!,
                email: referent.email,
                type: "referents",
              });
            }
          });
        }
      }

      // Chefs de centre
      if (selectedTypes.includes("chefs-centres") && young.sessionPhase1Id) {
        const session = sessionsMap.get(young.sessionPhase1Id);
        if (session?.headCenterId) {
          const headCenter = referentsMap.get(session.headCenterId);
          if (headCenter?.role === ROLES.HEAD_CENTER) {
            recipientsMap.set(headCenter.email, {
              firstName: headCenter.firstName!,
              lastName: headCenter.lastName!,
              email: headCenter.email,
              type: "chefs-centres",
            });
          }
        }
      }

      // Chefs d'établissement
      if (selectedTypes.includes("chefs-etablissement") && young.etablissementId) {
        const establishment = establishmentsMap.get(young.etablissementId);
        if (establishment) {
          establishment.referentEtablissementIds.forEach((refId) => {
            const referent = referentsMap.get(refId);
            if (referent?.subRole === "referent_etablissement") {
              recipientsMap.set(referent.email, {
                firstName: referent.firstName!,
                lastName: referent.lastName!,
                email: referent.email,
                type: "chefs-etablissement",
              });
            }
          });
        }
      }

      // Coordinateurs CLE
      if (selectedTypes.includes("administrateurs") && young.etablissementId) {
        const establishment = establishmentsMap.get(young.etablissementId);
        if (establishment) {
          establishment.coordinateurIds?.forEach((coordId) => {
            const coordinator = referentsMap.get(coordId);
            if (coordinator) {
              recipientsMap.set(coordinator.email, {
                firstName: coordinator.firstName!,
                lastName: coordinator.lastName!,
                email: coordinator.email,
                type: "administrateurs",
              });
            }
          });
        }
      }
    });

    setIsProcessing(false);
    return Array.from(recipientsMap.values());
  };

  return {
    processRecipients,
    isLoading: classesQuery.isLoading || sessionsQuery.isLoading || establishmentsQuery.isLoading || referentsQuery.isLoading,
  };
};
