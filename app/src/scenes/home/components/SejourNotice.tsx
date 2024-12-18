import useAuth from "@/services/useAuth";
import React from "react";
import { HiArrowRight } from "react-icons/hi";
import { Link } from "react-router-dom";
import { CohortType, getCohortPeriod, YOUNG_STATUS } from "snu-lib";

export default function SejourNotice({ cohort }: { cohort: CohortType }) {
  const { young, isHTS } = useAuth();

  return (
    <section id="changer-de-sejour" className="mt-4 border rounded-md p-4">
      {young.status === YOUNG_STATUS.WAITING_LIST ? (
        <p>
          Vous êtes inscrit(e) sur liste complémentaire pour le séjour <strong>{getCohortPeriod(cohort)}</strong>.
        </p>
      ) : (
        <p>
          Vous êtes positionné(e) sur le séjour <strong>{getCohortPeriod(cohort)}</strong>.
        </p>
      )}

      {isHTS && (
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
