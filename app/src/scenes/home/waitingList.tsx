import hero from "../../assets/hero/home-not-done.png";
import React from "react";
import { Link } from "react-router-dom";
import useAuth from "@/services/useAuth";
import { getCohort } from "../../utils/cohorts";
import { getCohortPeriod } from "snu-lib";
import HomeContainer from "@/components/layout/HomeContainer";
import HomeHeader from "@/components/layout/HomeHeader";
import Notice from "@/components/ui/alerts/Notice";
import { HiArrowRight } from "react-icons/hi";
import usePermissions from "@/hooks/usePermissions";

export default function WaitingList() {
  const { young, isCLE } = useAuth();
  const cohort = getCohort(young.cohort);
  const { canModifyInscription } = usePermissions();
  const title = `${young.firstName}, bienvenue sur votre compte ${isCLE ? "élève" : "volontaire"}`;

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

          <Notice>
            <p className="font-bold">Votre inscription au SNU est bien validée. </p>
            <p>Nous vous recontacterons dès qu’une place se libère dans les prochains jours</p>
          </Notice>
        </div>
      </HomeHeader>
    </HomeContainer>
  );
}
