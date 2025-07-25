import usePermissions from "@/hooks/usePermissions";
import useAuth from "@/services/useAuth";
import useCohort from "@/services/useCohort";
import { redirectToCorrection } from "@/utils/navigation";
import React from "react";
import { HiExclamation, HiPencilAlt } from "react-icons/hi";
import { Link } from "react-router-dom";
import { CorrectionRequestType, translateCorrectionReason, translateField } from "snu-lib";

export default function CorrectionRequests() {
  const { young } = useAuth();
  const { cohort } = useCohort();
  const { canModifyInscription } = usePermissions();
  const correctionRequests = young?.correctionRequests as unknown as CorrectionRequestType[];
  const filteredRequests = correctionRequests.filter((c) => ["SENT", "REMINDED"].includes(c.status as any));
  const correctionDate = cohort?.inscriptionModificationEndDate ?? new Date();
  return (
    <section id="corrections">
      {canModifyInscription ? (
        <p className="my-4 font-bold">Correction(s) à apporter avant le {new Date(correctionDate).toLocaleDateString("fr-FR")}&nbsp;:</p>
      ) : (
        <p className="my-4 font-bold">Les corrections demandées n’ont pas été effectuées à temps.</p>
      )}

      <div className="grid grid-cols-1 gap-2">
        {filteredRequests?.map((correction: CorrectionRequestType) => <CorrectionRequest key={correction._id} correction={correction} />)}
      </div>
    </section>
  );
}

function CorrectionRequest({ correction }: { correction: CorrectionRequestType }) {
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
