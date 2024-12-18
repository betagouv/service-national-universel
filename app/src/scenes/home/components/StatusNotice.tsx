import Notice from "@/components/ui/alerts/Notice";
import usePermissions from "@/hooks/usePermissions";
import { setYoung } from "@/redux/auth/actions";
import { capture } from "@/sentry";
import API from "@/services/api";
import React from "react";
import { HiClock } from "react-icons/hi";
import { useDispatch } from "react-redux";
import { toastr } from "react-redux-toastr";
import { useHistory } from "react-router-dom";
import { translate, YOUNG_STATUS } from "snu-lib";

const notices = {
  [YOUNG_STATUS.WAITING_VALIDATION]: <WaitingValidation />,
  [YOUNG_STATUS.WAITING_CORRECTION]: <WaitingCorrection />,
  [YOUNG_STATUS.WAITING_LIST]: <WaitingList />,
};

export default function StatusNotice({ status }: { status: string }) {
  return notices[status] || null;
}

function WaitingValidation() {
  const history = useHistory();
  const dispatch = useDispatch();
  const { canModifyInscription } = usePermissions();

  async function handleGoToInscription() {
    try {
      const { ok, code, data } = await API.put(`/young/inscription2023/goToInscriptionAgain`);
      if (!ok) {
        toastr.error("Oups, une erreur est survenue :", translate(code));
        return;
      }
      dispatch(setYoung(data));
      history.push("/inscription/profil");
    } catch (e) {
      capture(e);
      toastr.error("Oups, une erreur est survenue :", translate(e.code));
    }
  }

  return (
    <Notice>
      <p className="font-bold">Votre dossier est en cours de traitement par l’administration.</p>
      <p>Vous recevrez prochainement un e-mail de no_reply@snu.gouv.fr vous informant de l’avancement de votre inscription.</p>
      {canModifyInscription && (
        <button
          className="bg-blue-600 text-white w-full md:w-fit px-6 py-2.5 text-center rounded-md text-sm mt-3 hover:bg-blue-800 transition-colors"
          onClick={handleGoToInscription}>
          Consulter mon dossier d’inscription
        </button>
      )}
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
      <p>Nous vous recontacterons dès qu’une place se libère dans les prochains jours</p>
    </Notice>
  );
}
