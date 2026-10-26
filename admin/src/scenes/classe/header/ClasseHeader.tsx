import React, { useMemo } from "react";
import { useSelector } from "react-redux";

import { translateStatusClasse, ClassesRoutes, canInviteYoung, COHORT_TYPE } from "snu-lib";
import { Header, Badge } from "@snu/ds/admin";

import { TStatus } from "@/types";
import { AuthState } from "@/redux/auth/reducer";
import { CohortState } from "@/redux/cohorts/reducer";

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

  const canPerformManualInscriptionActions = useMemo(() => {
    const filteredCohorts = cohorts.filter((c) => classe?.cohort === c.name || (c.type === COHORT_TYPE.CLE && getRights(user, classe, c).canEditCohort));
    const cohort = filteredCohorts.find((c) => c.name === classe?.cohort);
    return canInviteYoung(user, cohort ?? null);
  }, [cohorts, classe, user]);

  const id = classe._id;

  return (
    <>
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
        actions={getHeaderActionList({ user, classe, setClasse, isLoading, setIsLoading, id, studentStatus, canPerformManualInscriptionActions })}
      />
      <NavbarClasse classeId={id} />
    </>
  );
}
