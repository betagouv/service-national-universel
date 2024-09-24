import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

import { ROLES } from "snu-lib";

import Pencil from "@/assets/icons/Pencil";
import api from "@/services/api";

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
      //When inscription is open for youngs, we don't want to display the cohort to come
      // const isEligibleForCohortToCome = calculateAge(young.birthdateAt, new Date("2023-09-30")) < 18;
      // const cohortToCome = { name: "à venir", isEligible: isEligibleForCohortToCome };
      // if (user.role !== ROLES.ADMIN) {
      //   setOptions(isEligibleForCohortToCome && young.cohort !== "à venir" ? [cohortToCome] : []);
      //   return;
      // }
      const { data } = await api.post(`/cohort-session/eligibility/2023/${young._id}`);
      if (Array.isArray(data)) {
        const cohorts: CohortAvailable[] = data.map((c) => ({ name: c.name, goal: c.goalReached, isEligible: c.isEligible, type: c.type })).filter((c) => c.name !== young.cohort);
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
