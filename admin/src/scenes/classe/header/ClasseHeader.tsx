import React, { useMemo } from "react";
import { useSelector } from "react-redux";

import { HiOutlineRefresh } from "react-icons/hi";
import { useQuery } from "@tanstack/react-query";

import { translateStatusClasse, ClassesRoutes, canInviteYoung, COHORT_TYPE, TaskStatus, formatLongDateFR } from "snu-lib";
import { Header, Badge } from "@snu/ds/admin";

import { TStatus } from "@/types";
import { AuthState } from "@/redux/auth/reducer";
import { CohortState } from "@/redux/cohorts/reducer";
import { appURL } from "@/config";
import InfoMessage from "@/scenes/dashboardV2/components/ui/InfoMessage";
import { ClasseService } from "@/services/classeService";

import { getHeaderActionList } from "./index";
import NavbarClasse from "../components/NavbarClasse";
import { statusClassForBadge, getRights } from "../utils";

interface Props {
  classe: NonNullable<ClassesRoutes["GetOne"]["response"]["data"]>;
  setClasse: (classe: ClassesRoutes["GetOne"]["response"]["data"]) => void;
  isLoading: boolean;
  setIsLoading: (b: boolean) => void;
  studentStatus: { [key: string]: number };
  page: string;
}

export default function ClasseHeader({ classe, setClasse, isLoading, setIsLoading, studentStatus, page }: Props) {
  const user = useSelector((state: AuthState) => state.Auth.user);
  const cohorts = useSelector((state: CohortState) => state.Cohorts);

  const { data: inscriptionMasseStatus } = useQuery<ClassesRoutes["InscriptionEnMasseStatut"]["response"]>({
    queryKey: ["inscription-en-masse", classe._id],
    queryFn: async () => ClasseService.getStatusInscriptionEnMasse(classe._id!),
    enabled: !!classe._id,
    retry: false,
    refetchInterval: (data) => {
      if ([TaskStatus.IN_PROGRESS, TaskStatus.PENDING].includes(data.state.data?.status as TaskStatus)) {
        return 1000;
      }
      return false;
    },
  });

  // const isImportInProgress = ;

  const canPerformManualInscriptionActions = useMemo(() => {
    const filteredCohorts = cohorts.filter((c) => classe?.cohort === c.name || (c.type === COHORT_TYPE.CLE && getRights(user, classe, c).canEditCohort));
    const cohort = filteredCohorts.find((c) => c.name === classe?.cohort);
    return canInviteYoung(user, cohort ?? null);
  }, [cohorts, classe, user]);

  const id = classe._id;
  const url = `${appURL}/je-rejoins-ma-classe-engagee?id=${id.toString()}`;

  return (
    <>
      {inscriptionMasseStatus && [TaskStatus.IN_PROGRESS, TaskStatus.PENDING].includes(inscriptionMasseStatus?.status as TaskStatus) && (
        <InfoMessage title="Un import de liste d'élèves est en cours de chargement..." icon={HiOutlineRefresh} className="mb-4" />
      )}
      {inscriptionMasseStatus && inscriptionMasseStatus?.status === TaskStatus.FAILED && (
        <InfoMessage
          title="Un import de liste d'élèves a échoué, veuillez réessayer"
          message={`Date de l'erreur : ${formatLongDateFR(inscriptionMasseStatus.statusDate)}`}
          priority="urgent"
          className="mb-4"
        />
      )}
      <Header
        title={classe.name || "Informations nécessaires"}
        titleComponent={<Badge className="mx-4 mt-2" title={translateStatusClasse(classe.status)} status={statusClassForBadge(classe.status) as TStatus} />}
        breadcrumb={[
          { title: "Séjours" },
          {
            title: "Classes",
            to: "/classes",
          },
          { title: page },
        ]}
        actions={getHeaderActionList({ user, classe, setClasse, isLoading, setIsLoading, url, id, studentStatus, canPerformManualInscriptionActions })}
      />
      <NavbarClasse classeId={id} />
    </>
  );
}
