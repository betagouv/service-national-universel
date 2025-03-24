import Notice from "@/components/ui/alerts/Notice";
import useCohort from "@/services/useCohort";
import dayjs from "dayjs";
import React from "react";

export default function AttestationNotice() {
  const { cohort } = useCohort();
  const cohortEndDate = dayjs(cohort.dateEnd);
  const cohortEndDatePlusFifteenDays = cohortEndDate.add(15, "day").format("DD/MM/YYYY");

  return <Notice>Votre attestation de réalisation de la phase 1 sera disponible le {cohortEndDatePlusFifteenDays}.</Notice>;
}
