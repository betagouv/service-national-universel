import Img2 from "snu-lib";
import React from "react";
import { Modal } from "reactstrap";
import { translateStatusMilitaryPreparationFiles, translate } from "../../../../utils";
import CloseSvg from "../../../../assets/Close";
import Prepa from "../../../../assets/icons/Prepa";
import DocumentsPM from "../../../militaryPreparation/components/DocumentsPM";
import { useDispatch } from "react-redux";
import api from "../../../../services/api";
import { toastr } from "react-redux-toastr";
import { setYoung } from "../../../../redux/auth/actions";
import { capture } from "../../../../sentry";
import { SENDINBLUE_TEMPLATES } from "snu-lib";

export default function ModalPM({ theme, open, setOpen, young }) {
  const dispatch = useDispatch();
  const onCorrection = async () => {
    try {
      const responseChangeStatusPM = await api.put(`/young/${young._id}/phase2/militaryPreparation/status`, { statusMilitaryPreparationFiles: "WAITING_VERIFICATION" });
      if (!responseChangeStatusPM.ok) return toastr.error(translate(responseChangeStatusPM?.code), "Oups, une erreur est survenue de la modification de votre dossier.");

      const responseReminderReferent = await api.post(`/application/notify/docs-military-preparation/${SENDINBLUE_TEMPLATES.referent.MILITARY_PREPARATION_DOCS_SUBMITTED}`);
      if (!responseReminderReferent?.ok) return toastr.error(translate(responseReminderReferent?.code), "Une erreur s'est produite avec le service de notification.");

      dispatch(setYoung(responseChangeStatusPM.data));
    } catch (e) {
      capture(e);
    }
  };
  return (
    <Modal isOpen={open} centered>
      <div className="w-full px-3 py-3">
        <div className="flex items-center justify-between">
          <div
            className={`text-xs font-normal ${theme.background[young.statusMilitaryPreparationFiles]} ${
              theme.text[young.statusMilitaryPreparationFiles]
            } rounded-sm px-2 py-[2px] `}>
            {translateStatusMilitaryPreparationFiles(young.statusMilitaryPreparationFiles)}
          </div>
          <CloseSvg className="text-gray-500" height={12} width={12} onClick={() => setOpen(false)} />
        </div>
        <div className="mt-4 flex items-center gap-2">
          <Prepa className="mr-2 h-6 w-6 text-gray-500" />
          <div className="text-lg font-bold leading-5">Dossier d&apos;éligibilité aux Préparations militaires</div>
        </div>
        {young.statusMilitaryPreparationFiles === "WAITING_CORRECTION" ? (
          <>
            <div className="mt-4 mb-4 flex items-center justify-between gap-6 rounded-lg bg-gray-50 px-2 py-3">
              <div className="flex flex-1 flex-col">
                <div className="text-base font-bold">Corrections demandées</div>
                <div className="text-sm text-gray-500">{young.militaryPreparationCorrectionMessage}</div>
                <button className="mt-4 rounded-lg border-[1px] border-blue-700 px-4 py-2 text-blue-700 hover:bg-blue-700 hover:text-white" onClick={onCorrection}>
                  Envoyer ma correction
                </button>
              </div>
            </div>
          </>
        ) : null}
        <DocumentsPM showHelp={false} />
      </div>
    </Modal>
  );
}
