import usePermissions from "@/hooks/usePermissions";
import useAuth from "@/services/useAuth";
import React from "react";
import { HiArrowRight } from "react-icons/hi";
import { Link } from "react-router-dom";
import { CohortType, getCohortPeriod, YOUNG_STATUS } from "snu-lib";

export default function SejourNotice({ cohort }: { cohort: CohortType }) {
  const { young, isCLE } = useAuth();
  const { canModifyInscription } = usePermissions();

  return (
    <section id="changer-de-sejour" className="mt-4 border rounded-md p-4">
      <p>
        Vous êtes {young.status === YOUNG_STATUS.WAITING_LIST ? "positionné(e) sur" : "inscrit(e) sur liste complémentaire pour"} le séjour{" "}
        <strong>{getCohortPeriod(cohort)}</strong>.
      </p>
      {canModifyInscription && !isCLE && (
        <Link to="/changer-de-sejour">
          <p className="mt-2 text-sm text-blue-600">
            Changer de séjour
            <HiArrowRight className="inline-block ml-1" />
          </p>
        </Link>
      )}
    </section>
  );
}
