import React from "react";
import useAuth from "@/services/useAuth";
import Done from "./scenes/done";
import Cancel from "./cancel";
import WaitingAffectation from "./waitingAffectation";
import { YOUNG_STATUS_PHASE1 } from "../../utils";
import { Redirect } from "react-router-dom";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import usePermissions from "@/hooks/usePermissions";

export default function Phase1() {
  useDocumentTitle("Phase 1 - Séjour");
  const { young } = useAuth();
  const { canViewPhase1 } = usePermissions();

  if (!canViewPhase1) return <Redirect to="/" />;
  if (young.statusPhase1 === YOUNG_STATUS_PHASE1.DONE) return <Done />;
  if (young.statusPhase1 === YOUNG_STATUS_PHASE1.EXEMPTED && young.cohesion2020Step !== "DONE") return <Cancel />;
  // La phase 1 est fermée : plus de séjour ni de convocation. Un volontaire encore affecté retrouve
  // l'accueil, qui lui indique qu'il n'a pas réalisé le séjour (GOO-51).
  if (young.statusPhase1 === YOUNG_STATUS_PHASE1.AFFECTED) return <Redirect to="/" />;
  return <WaitingAffectation />;
}
