import React from "react";
import { Modal } from "reactstrap";
import { translateStatusMilitaryPreparationFiles } from "../../../../utils";
import CloseSvg from "../../../../assets/Close";
import Prepa from "../../../../assets/icons/Prepa";
import DocumentsPM from "../../../militaryPreparation/components/DocumentsPM";
import { useDispatch } from "react-redux";
import api from "../../../../services/api";
import { toastr } from "react-redux-toastr";
import { setYoung } from "../../../../redux/auth/actions";
import { capture } from "../../../../sentry";
const { SENDINBLUE_TEMPLATES } = require("snu-lib");

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
            } px-2 py-[2px] rounded-sm `}>
            {translateStatusMilitaryPreparationFiles(young.statusMilitaryPreparationFiles)}
          </div>
          <CloseSvg className="text-gray-500" height={12} width={12} onClick={() => setOpen(false)} />
        </div>
        <div className="flex items-center gap-2 mt-4">
          <Prepa className="w-6 h-6 mr-2 text-gray-500" />
          <div className="text-lg leading-5 font-bold">Dossier d&apos;éligibilité aux Préparations militaires</div>
        </div>
        {young.statusMilitaryPreparationFiles === "WAITING_CORRECTION" ? (
          <>
            <div className="flex justify-between items-center px-2 py-3 rounded-lg bg-gray-50 mb-4 gap-6">
              <div className="flex flex-col flex-1">
                <div className="text-base font-bold">Corrections demandées</div>
                <div className="text-sm text-gray-500">{young.militaryPreparationCorrectionMessage}</div>
              </div>
              <button className="mr-4 border-[1px] border-blue-700 hover:bg-blue-700 text-blue-700 hover:text-white px-4 py-2 rounded-lg" onClick={onCorrection}>
                Envoyer ma correction
              </button>
            </div>
          </>
        ) : null}
        <DocumentsPM showHelp={false} />
      </div>
    </Modal>
  );
}
