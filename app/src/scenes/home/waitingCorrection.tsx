import React from "react";
import { Link } from "react-router-dom";
import hero from "../../assets/hero/home-not-done.png";
import { translateField, translateCorrectionReason, getCohortPeriod } from "snu-lib";
import { redirectToCorrection } from "../../utils/navigation";
import { getCohort } from "@/utils/cohorts";
import useAuth from "@/services/useAuth";
import HomeContainer from "@/components/layout/HomeContainer";
import HomeHeader from "@/components/layout/HomeHeader";
import { HiArrowRight, HiClock, HiExclamation, HiPencilAlt } from "react-icons/hi";
import JDMA from "@/components/JDMA";
import usePermissions from "@/hooks/usePermissions";

type CorrectionType = {
  _id: string;
  createdAt: string;
  field: string;
  message: string;
  moderatorId: string;
  reason: string;
  sentAt: string;
  status: string;
};

export default function WaitingCorrection() {
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

          <div className="bg-amber-50 text-amber-800 p-3 rounded-md flex gap-2">
            <div className="flex-none">
              <HiClock className="text-amber-400 h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-sm">Votre dossier est en attente de correction.</p>
            </div>
          </div>
        </div>
      </HomeHeader>

      {canModifyInscription ? (
        <p className="my-8 font-bold">Correction(s) à apporter avant le {new Date(cohort.inscriptionModificationEndDate).toLocaleDateString("fr-FR")}&nbsp;:</p>
      ) : (
        <p>Les corrections demandées n’ont pas été effectuées à temps.</p>
      )}

      {young.correctionRequests
        ?.filter((c: CorrectionType) => ["SENT", "REMINDED"].includes(c.status as any))
        .map((correction: CorrectionType) => <CorrectionRequest key={correction._id} correction={correction} />)}

      <div className="mt-12 flex justify-end">
        <JDMA id={3154} />
      </div>
    </HomeContainer>
  );
}

function CorrectionRequest({ correction }: { correction: CorrectionType }) {
  const { young } = useAuth();
  const { canModifyInscription } = usePermissions();
  const link = redirectToCorrection(young, correction.field);

  return (
    <div className="bg-amber-50 text-amber-800 text-sm p-3 flex gap-2 border-l-4 border-l-amber-400">
      <div className="flex-none">
        <HiExclamation className="text-amber-400 h-5 w-5" />
      </div>
      <div>
        <p className="font-semibold">{translateField(correction.field)}</p>
        <p>{translateCorrectionReason(correction.reason)}</p>
        <p>{correction.message}</p>
        {canModifyInscription && (
          <Link to={link}>
            <p className="bg-blue-600 w-fit text-white px-2.5 py-1.5 rounded-md text-sm mt-3 hover:bg-blue-800 transition-colors">
              <HiPencilAlt className="text-white inline-block mr-1 h-4 w-4" />
              Corriger
            </p>
          </Link>
        )}
      </div>
    </div>
  );
}
