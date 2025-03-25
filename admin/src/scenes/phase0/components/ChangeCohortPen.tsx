import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

import { ROLES } from "snu-lib";

import Pencil from "@/assets/icons/Pencil";
import { CohortService } from "@/services/cohortService";

import { AuthState } from "@/redux/auth/reducer";
import { ChangeCohortModal } from "./modal/ChangeCohortModal";

interface CohortAvailable {
  name: string;
  type: "VOLONTAIRE" | "CLE";
  isEligible?: boolean | undefined;
  goal?: boolean | undefined;
}

export function ChangeCohortPen({ young, onChange }) {
  const user = useSelector((state: AuthState) => state.Auth.user);
  const [changeCohortModal, setChangeCohortModal] = useState(false);
  const [options, setOptions] = useState<CohortAvailable[]>([]);

  const disabled = ![ROLES.ADMIN, ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION].includes(user.role);

  useEffect(() => {
    if (!young) return undefined;

    (async function getSessions() {
      const cohortsAvailable = await CohortService.getEligibilityForYoung({ id: young._id, query: { type: "BASCULE" } });
      if (Array.isArray(cohortsAvailable)) {
        const cohorts: CohortAvailable[] = cohortsAvailable
          .filter((c) => c.name !== young.cohort)
          .map((c) => ({ name: c.name, goal: c.goalReached, isEligible: c.isEligible, type: c.type }));
        // TODO: rajouter un flag hidden pour les cohort non visible
        cohorts.push({ name: "à venir", type: "VOLONTAIRE" });
        setOptions(cohorts);
      } else setOptions([]);
    })();
  }, [young]);

  if (disabled) return null;

  return (
    <>
      <div
        className="mr-[15px] flex cursor-pointer items-center justify-center rounded-[4px] border-[1px] border-[transparent] p-[9px] hover:border-[#E5E7EB]"
        onClick={() => setChangeCohortModal(true)}>
        <Pencil stroke="#66A7F4" className="h-[11px] w-[11px]" />
      </div>
      <ChangeCohortModal isOpen={changeCohortModal} user={user} young={young} cohorts={options} onClose={() => setChangeCohortModal(false)} onChange={onChange} />
    </>
  );
}
