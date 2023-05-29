import Img2 from "snu-lib";
import React from "react";
import { translateStatusMilitaryPreparationFiles, translate } from "../../../../utils";
import { BsChevronDown } from "react-icons/bs";
import DocumentsPM from "../../../militaryPreparation/components/DocumentsPM";
import Prepa from "../../../../assets/icons/Prepa";
import { useDispatch } from "react-redux";
import api from "../../../../services/api";
import { toastr } from "react-redux-toastr";
import { setYoung } from "../../../../redux/auth/actions";
import { capture } from "../../../../sentry";
import { SENDINBLUE_TEMPLATES } from "snu-lib";

export default function CardPM({ young }) {
  const [open, setOpen] = React.useState(false);
  const dispatch = useDispatch();

  const theme = {
    background: {
      WAITING_VERIFICATION: "bg-sky-100",
      WAITING_CORRECTION: "bg-[#FD7A02]",
      VALIDATED: "bg-[#71C784]",
      REFUSED: "bg-red-500",
    },
    text: {
      WAITING_VERIFICATION: "text-sky-600",
      WAITING_CORRECTION: "text-white",
      VALIDATED: "text-white",
      REFUSED: "text-white",
    },
  };

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
    <div className="mb-4 flex w-full flex-col rounded-lg bg-white px-4 pt-3 shadow-md">
      <div className="mb-3 cursor-pointer" onClick={() => setOpen(young.statusMilitaryPreparationFiles !== "REFUSED" ? !open : false)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Prepa className="mr-2 h-6 w-6 text-gray-500" />
            <div className="text-base font-bold leading-5">Dossier d&apos;éligibilité aux Préparations militaires</div>
          </div>
          <div className="flex items-center gap-5">
            <div
              className={`text-xs font-normal ${theme.background[young.statusMilitaryPreparationFiles]} ${
                theme.text[young.statusMilitaryPreparationFiles]
              } rounded-sm px-2 py-[2px] `}>
              {translateStatusMilitaryPreparationFiles(young.statusMilitaryPreparationFiles)}
            </div>
            {young.statusMilitaryPreparationFiles !== "REFUSED" ? <BsChevronDown className={`h-5 w-5 text-gray-400 ${open ? "rotate-180" : ""}`} /> : null}
          </div>
        </div>
      </div>
      {open ? (
        <>
          <hr className="text-gray-200" />
          {young.statusMilitaryPreparationFiles === "WAITING_CORRECTION" ? (
            <>
              <div className="mt-4 mb-4 flex items-center justify-between gap-6 rounded-lg bg-gray-50 px-2 py-3">
                <div className="flex flex-1 flex-col">
                  <div className="text-base font-bold">Corrections demandées</div>
                  <div className="text-sm text-gray-500">{young.militaryPreparationCorrectionMessage}</div>
                </div>
                <button className="mr-4 rounded-lg border-[1px] border-blue-700 px-4 py-2 text-blue-700 hover:bg-blue-700 hover:text-white" onClick={onCorrection}>
                  Envoyer ma correction
                </button>
              </div>
            </>
          ) : null}
          <DocumentsPM showHelp={false} />
        </>
      ) : null}
    </div>
  );
}
