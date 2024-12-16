import React from "react";
import { Link } from "react-router-dom";
import { getCohortPeriod, YOUNG_STATUS } from "../../utils";
import { getCohort } from "@/utils/cohorts";
import useAuth from "@/services/useAuth";
import HomeContainer from "@/components/layout/HomeContainer";
import HomeHeader from "@/components/layout/HomeHeader";
import hero from "../../assets/hero/home-not-done.png";
import { HiArrowRight } from "react-icons/hi";
import JDMA from "@/components/JDMA";
import usePermissions from "@/hooks/usePermissions";
import CorrectionRequests from "./components/CorrectionRequests";
import StatusNotice from "./components/StatusNotice";

export default function EnAttente() {
  const { young, isCLE } = useAuth();
  const title = `${young.firstName}, bienvenue sur votre compte ${isCLE ? "élève" : "volontaire"}`;
  const cohort = getCohort(young.cohort);
  const { canModifyInscription } = usePermissions();

  return (
    <HomeContainer>
      <HomeHeader title={title} img={hero}>
        <div className="grid grid-cols-1 gap-8">
          <section id="changer-de-sejour" className="mt-4 border rounded-md p-4">
            <p>
              Vous êtes positionné(e) sur le séjour <strong>{getCohortPeriod(cohort)}</strong>.
            </p>
            {canModifyInscription && (
              <Link to="/changer-de-sejour">
                <p className="mt-2 text-sm text-blue-600">
                  Changer de séjour
                  <HiArrowRight className="inline-block ml-1" />
                </p>
              </Link>
            )}
          </section>

          <StatusNotice status={young.status} />
        </div>
      </HomeHeader>

      {young.status === YOUNG_STATUS.WAITING_CORRECTION && <CorrectionRequests />}

      <div className="mt-12 flex justify-end">
        <JDMA id={3154} />
      </div>
    </HomeContainer>
  );
}
