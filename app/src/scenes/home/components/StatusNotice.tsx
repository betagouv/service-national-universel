import Notice from "@/components/ui/alerts/Notice";
import React from "react";
import { HiClock } from "react-icons/hi";
import { YOUNG_STATUS } from "snu-lib";

const notices = {
  [YOUNG_STATUS.WAITING_VALIDATION]: <WaitingValidation />,
  [YOUNG_STATUS.WAITING_CORRECTION]: <WaitingCorrection />,
  [YOUNG_STATUS.WAITING_LIST]: <WaitingList />,
  [YOUNG_STATUS.REFUSED]: <Refused />,
};

export default function StatusNotice({ status }: { status: string }) {
  return notices[status] || null;
}

function WaitingValidation() {
  return (
    <Notice>
      <p className="font-bold">Votre dossier est en cours de traitement par l’administration.</p>
      <p>Vous recevrez prochainement un e-mail de no_reply@snu.gouv.fr vous informant de l’avancement de votre inscription.</p>
    </Notice>
  );
}

function WaitingCorrection() {
  return (
    <div className="bg-amber-50 text-amber-800 p-3 rounded-md flex gap-2">
      <div className="flex-none">
        <HiClock className="text-amber-400 h-5 w-5" />
      </div>
      <div>
        <p className="font-semibold text-sm">Votre dossier est en attente de correction.</p>
      </div>
    </div>
  );
}

function WaitingList() {
  return (
    <Notice>
      <p className="font-bold">Votre inscription au SNU est bien validée.</p>
      <p>Nous vous recontacterons si une place venait à se libérer</p>
    </Notice>
  );
}

function Refused() {
  return (
    <Notice>
      <p className="font-bold">Votre inscription n&apos;a pas pu être retenue.</p>
      <p>Suite au traitement de votre dossier d&apos;inscription, votre référent n&apos;a pas pu retenir votre inscription.</p>
    </Notice>
  );
}
