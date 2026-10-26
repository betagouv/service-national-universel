import React from "react";
import useAuth from "@/services/useAuth";
import { YOUNG_STATUS } from "snu-lib";
import WaitingAffectation from "./waitingAffectation";
import EnAttente from "./EnAttente";

export default function HomePhase1() {
  const { young } = useAuth();

  if ([YOUNG_STATUS.WAITING_VALIDATION, YOUNG_STATUS.WAITING_CORRECTION, YOUNG_STATUS.WAITING_LIST].includes(young.status as any)) return <EnAttente />;
  return <WaitingAffectation />;
}
